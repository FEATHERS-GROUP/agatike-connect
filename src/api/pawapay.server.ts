import { hasuraRequest } from "./graphql.server";

export async function handlePawaPayWebhook(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    console.log(`[PawaPay Webhook] Received callback for ${path}:`, body);

    const providerReference = body.depositId || body.payoutId || body.refundId;
    const providerStatus = body.status; // e.g., "COMPLETED", "FAILED"

    if (providerReference) {
      // 1. Update the wallet transaction status
      const updateQuery = `
        mutation UpdateWalletTransaction($provider_reference: String!, $provider_status: String!, $status: String!, $raw_callback_data: jsonb) {
          update_wallet_transactions(
            where: { provider_reference: { _eq: $provider_reference } }, 
            _set: { 
              provider_status: $provider_status, 
              status: $status,
              raw_callback_data: $raw_callback_data,
              updated_at: "now()"
            }
          ) {
            returning {
              id
              status
              reference_id
              type
              amount
              net_amount
              workspace_id
            }
          }
        }
      `;

      const res = await hasuraRequest<{ update_wallet_transactions: any }>(updateQuery, {
        provider_reference: providerReference,
        provider_status: providerStatus || "UNKNOWN",
        status:
          providerStatus === "COMPLETED"
            ? "completed"
            : providerStatus === "FAILED"
              ? "failed"
              : "pending",
        raw_callback_data: body,
      });

      const tx = res.update_wallet_transactions?.returning?.[0];

      let customerFee = 0;
      if (tx) {
        // Now update earnings safely via wallet_transaction_id instead of relying on relationships
        const earnRes = await hasuraRequest<{ update_earnings: { returning: any[] } }>(
          `mutation UpdateEarningsStatus($txId: uuid!, $status: String!) {
             update_earnings(where: { wallet_transaction_id: { _eq: $txId } }, _set: { status: $status, updated_at: "now()" }) { 
               returning { customer_fee }
             }
          }`,
          { txId: tx.id, status: tx.status }
        );
        customerFee = earnRes.update_earnings?.returning?.[0]?.customer_fee || 0;
      }

      // 2. If it's a completed deposit, activate the associated ticket/subscription
      if (tx && tx.status === "completed") {
        if (tx.type === "event_ticket") {
          // Update event_attendees status to "Confirmed" based on a unique custom group ID (reference_id)
          const confirmQuery = `
            mutation ConfirmEventAttendees($booking_ref: String!) {
              update_event_attendees(
                where: { custom_fields: { _contains: { booking_ref: $booking_ref } } },
                _set: { status: "Confirmed" }
              ) {
                returning {
                  id
                  email
                  phone
                  names
                  qrcode_number
                  events {
                    title
                    workspaces {
                      name
                    }
                  }
                }
              }
            }
          `;
          const attendeeRes = await hasuraRequest<{ update_event_attendees: { returning: any[] } }>(confirmQuery, { booking_ref: tx.reference_id });
          const confirmedAttendees = attendeeRes.update_event_attendees?.returning || [];

          // Also confirm any product_orders that are pending payment linked to tickets in this booking
          const confirmProductOrdersQuery = `
            mutation ConfirmProductOrders($booking_ref: String!) {
              update_product_orders(
                where: { decrptions: { _eq: $booking_ref }, status: { _eq: "Pending Payment" } },
                _set: { status: "Confirmed" }
              ) {
                returning {
                  product_id
                  qty
                  size
                  product {
                    name
                  }
                }
              }
            }
          `;
          let confirmedOrders: any[] = [];
          try {
            const confirmRes = await hasuraRequest<{ update_product_orders: any }>(confirmProductOrdersQuery, { booking_ref: tx.reference_id });
            confirmedOrders = confirmRes?.update_product_orders?.returning || [];
            if (confirmedOrders.length > 0) {
              const { deductInventoryFromOrders } = await import("./inventory.server");
              await deductInventoryFromOrders(confirmedOrders);
            }
          } catch (e) {
            console.error("[PawaPay] Failed to confirm product orders:", e);
          }

          const firstAtt = confirmedAttendees.length > 0 ? confirmedAttendees[0] : null;
          const appUrl = process.env.PROJECT_PRODUCTION_URL ? `https://${process.env.PROJECT_PRODUCTION_URL}` : "https://agatike.com";
          
          const ticketCodes = confirmedAttendees.map(a => a.qrcode_number).filter(Boolean).join(", ");
          const productsText = confirmedOrders.length > 0 
            ? `Products: ${confirmedOrders.map(o => `${o.qty}x ${o.product?.name || "Item"}`).join(", ")}` 
            : "";
          const feeText = customerFee > 0 ? `(Inc. ${customerFee} ${body?.currency || ""} fee)` : "";
          
          const detailedMessage = `Payment of ${tx.amount} ${body?.currency || ""} ${feeText} confirmed! ${ticketCodes ? `Tickets: ${ticketCodes}` : ""} ${productsText}`.trim();
          
          if (firstAtt) {
            const { sendAttendeeEmail } = await import("./email");
            const eventName = firstAtt.events?.title || "Your Event";
            const orgName = firstAtt.events?.workspaces?.name || "The Organizer";

            const emailAddresses = [...new Set(confirmedAttendees.map((a: any) => a.email).filter(Boolean))];
            
            for (const email of emailAddresses) {
              await sendAttendeeEmail({
                data: {
                  to: email,
                  subject: `Your purchase for ${eventName} is confirmed!`,
                  message: detailedMessage,
                  eventName: eventName,
                  organizerName: orgName,
                  appUrl,
                  badgeLink: `${appUrl}/ticket/${firstAtt.id}`,
                }
              } as any).catch(e => console.error("Failed to send attendee email", e));
            }
          }

          // Send Event SMS with direct ticket links and products
          let phoneToNotify = body?.payer?.address?.value;
          if (!phoneToNotify && firstAtt?.phone) phoneToNotify = firstAtt.phone;
          if (!phoneToNotify && confirmedOrders.length > 0) phoneToNotify = confirmedOrders[0].phone;

          if (phoneToNotify) {
            const { sendSMS } = await import("./pindo");
            try {
              await sendSMS(phoneToNotify, detailedMessage);
            } catch (e) {
              console.error("[Pindo SMS] Failed to send payment confirmation:", e);
            }
          }
        } else if (tx.type === "space_subscription") {
          const activateSubQuery = `
            mutation ActivateSpaceSubscription($id: uuid!) {
              update_space_subscriptions_by_pk(
                pk_columns: { id: $id },
                _set: { status: "active" }
              ) {
                id
              }
            }
          `;
          await hasuraRequest(activateSubQuery, { id: tx.reference_id });
        } else if (tx.type === "venue_booking") {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            tx.reference_id,
          );

          if (isUuid) {
            const confirmQuery = `
              mutation ConfirmVenueBooking($id: uuid!) {
                update_venue_bookings_by_pk(
                  pk_columns: { id: $id },
                  _set: { payment_status: "Paid", status: "Confirmed" }
                ) { id }
              }
            `;
            await hasuraRequest(confirmQuery, { id: tx.reference_id });
          } else {
            // It's a payment_ref string spanning multiple bookings (e.g. from facility checkout)
            const confirmQuery = `
              mutation ConfirmVenueBookings($ref: String!) {
                update_venue_bookings(
                  where: { tickets_data: { _contains: { payment_ref: $ref } } },
                  _set: { payment_status: "Paid", status: "Confirmed" }
                ) { affected_rows }
              }
            `;
            await hasuraRequest(confirmQuery, { ref: tx.reference_id });
          }
        }

        // Safely fund the workspace wallet using the exactly computed net_amount (which securely deducts shortfalls!)
        if (tx.workspace_id && tx.net_amount && tx.type !== "subscription") {
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet({
            data: {
              workspace_id: tx.workspace_id,
              amount: parseFloat(tx.net_amount),
            },
          } as any);
        }

        // Send general SMS Confirmation via Pindo for other types
        if (tx.type !== "event_ticket" && body?.payer?.address?.value) {
          const phone = body.payer.address.value;
          const { sendSMS } = await import("./pindo");
          const msg = `Payment of ${tx.amount} confirmed! Thank you for your purchase. View your ticket/receipt at: https://agatike.com/profile`;
          try {
            await sendSMS(phone, msg);
          } catch (e) {
            console.error("[Pindo SMS] Failed to send payment confirmation:", e);
          }
        }
      }

      // 3. Handle Failed Withdrawals (Refund the wallet)
      if (tx && tx.status === "failed" && tx.type === "withdrawal") {
        if (tx.workspace_id && tx.amount) {
          console.log(
            `[PawaPay Webhook] Withdrawal failed. Refunding ${tx.amount} to workspace ${tx.workspace_id}`,
          );
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet({
            data: {
              workspace_id: tx.workspace_id,
              amount: parseFloat(tx.amount),
            },
          } as any);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[PawaPay Webhook] Error processing ${path}:`, error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
