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
    const providerStatus = body.status;

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

      let wsSlug = "";
      let wsName = "";
      if (tx?.workspace_id) {
        try {
          const wsData = await hasuraRequest<{
            workspaces_by_pk: { name: string };
            workspace_pages: { slug: string }[];
          }>(
            `query GetWS($id: uuid!) { 
                workspaces_by_pk(id: $id) { name } 
                workspace_pages(where: { workspace_id: { _eq: $id } }, limit: 1) { slug }
             }`,
            { id: tx.workspace_id },
          );
          if (wsData?.workspaces_by_pk) {
            wsName = wsData.workspaces_by_pk.name;
          }
          if (wsData?.workspace_pages?.length) {
            wsSlug = wsData.workspace_pages[0].slug;
          }
        } catch (e) {
          console.error("Failed to fetch workspace", e);
        }
      }

      let customerFee = 0;
      if (tx) {
        // Now update earnings safely via wallet_transaction_id instead of relying on relationships
        const earnRes = await hasuraRequest<{ update_earnings: { returning: any[] } }>(
          `mutation UpdateEarningsStatus($txId: uuid!, $status: String!) {
             update_earnings(where: { wallet_transaction_id: { _eq: $txId } }, _set: { status: $status, updated_at: "now()" }) { 
               returning { customer_fee }
             }
          }`,
          { txId: tx.id, status: tx.status },
        );
        customerFee = earnRes.update_earnings?.returning?.[0]?.customer_fee || 0;
      }

      // 2. If it's a completed deposit, activate the associated ticket/subscription
      if (tx && tx.status === "completed") {
        if (tx.type === "event_ticket" || tx.type === "page_builder_checkout") {
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
                    tour_stops
                    workspaces {
                      name
                    }
                  }
                }
              }
            }
          `;
          const attendeeRes = await hasuraRequest<{ update_event_attendees: { returning: any[] } }>(
            confirmQuery,
            { booking_ref: tx.reference_id },
          );
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
                  qr_code_string
                  product {
                    name
                  }
                }
              }
            }
          `;
          let confirmedOrders: any[] = [];
          try {
            const confirmRes = await hasuraRequest<{ update_product_orders: any }>(
              confirmProductOrdersQuery,
              { booking_ref: tx.reference_id },
            );
            confirmedOrders = confirmRes?.update_product_orders?.returning || [];
            if (confirmedOrders.length > 0) {
              const { deductInventoryFromOrders } = await import("./inventory.server");
              await deductInventoryFromOrders(confirmedOrders);
            }
          } catch (e) {
            console.error("[PawaPay] Failed to confirm product orders:", e);
          }

          const firstAtt = confirmedAttendees.length > 0 ? confirmedAttendees[0] : null;
          const appUrl = process.env.PROJECT_PRODUCTION_URL
            ? `https://${process.env.PROJECT_PRODUCTION_URL}`
            : "https://agatike.com";

          let eventName = "Your Event";
          let dateStr = "TBD";
          let eventLocation = "";

          if (firstAtt?.events) {
            eventName = firstAtt.events.title || eventName;
            const tourStops = Array.isArray(firstAtt.events.tour_stops)
              ? firstAtt.events.tour_stops
              : firstAtt.events.tour_stops
                ? [firstAtt.events.tour_stops]
                : [];
            const firstStop = tourStops[0] || {};
            dateStr = `${firstStop.date || "TBD"} ${firstStop.time || ""}`.trim();
            eventLocation = firstStop.venue || firstStop.city || "";
          }

          const ticketCodes = confirmedAttendees
            .map((a) => a.qrcode_number)
            .filter(Boolean)
            .join(", ");
          // Extract Guest Email from product_orders if present
          let guestEmail: string | null = null;
          let productQrCode: string | null = null;

          if (confirmedOrders.length > 0) {
            confirmedOrders.forEach((o) => {
              if (o.qr_code_string) productQrCode = o.qr_code_string;
              if (o.size && o.size.includes("| email:")) {
                const parts = o.size.split("| email:");
                o.size = parts[0].trim();
                if (!guestEmail) guestEmail = parts[1].trim();
              } else if (o.size && o.size.startsWith("email:")) {
                if (!guestEmail) guestEmail = o.size.replace("email:", "").trim();
                o.size = "";
              }
            });
          }

          const productsText =
            confirmedOrders.length > 0
              ? `${confirmedOrders.map((o) => `${o.qty}x ${o.product?.name || "Item"} (${o.size || "Standard"})`).join(", ")}`
              : "";
          const feeText =
            customerFee > 0 ? `(Inc. ${customerFee} ${body?.currency || ""} fee)` : "";

          const baseDomain = process.env.PROJECT_PRODUCTION_URL || "agatike.com";
          const domain = wsSlug ? `${wsSlug}.${baseDomain}` : baseDomain;

          let detailedMessage = "";

          if (!firstAtt && confirmedOrders.length > 0) {
            // Product-only purchase
            detailedMessage = `Payment completed for ${productsText}. Thank you for visiting ${domain}. It will be delivered to you or choose pickup. Order Ref: ${productQrCode || "N/A"}`;
          } else {
            // Ticket purchase
            detailedMessage =
              `Payment of ${tx.amount} ${body?.currency || ""} ${feeText} confirmed for ${eventName}! Date: ${dateStr}. ${eventLocation ? `Location: ${eventLocation}.` : ""} ${ticketCodes ? `Tickets: ${ticketCodes}` : ""} ${productsText ? `Products: ${productsText}` : ""}`.trim();
          }

          if (firstAtt) {
            const { sendAttendeeEmail } = await import("./email");
            const orgName = firstAtt.events?.workspaces?.name || "The Organizer";

            const emailAddresses = [
              ...new Set(confirmedAttendees.map((a: any) => a.email).filter(Boolean)),
            ];

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
                },
              } as any).catch((e) => console.error("Failed to send attendee email", e));
            }
          } else if (confirmedOrders.length > 0 && guestEmail) {
            // Product-only purchase email receipt
            const { sendAttendeeEmail } = await import("./email");
            const orgName = wsName || domain;

            await sendAttendeeEmail({
              data: {
                to: guestEmail,
                subject: `Your purchase from ${orgName} is confirmed!`,
                message: detailedMessage,
                eventName: "Product Store",
                organizerName: orgName,
                appUrl,
                badgeLink: `${appUrl}/`, // No specific badge link for products yet
              },
            } as any).catch((e) => console.error("Failed to send product email", e));
          }

          // Send Event SMS with direct ticket links and products
          let phoneToNotify = body?.payer?.address?.value;
          if (!phoneToNotify && firstAtt?.phone) phoneToNotify = firstAtt.phone;
          if (!phoneToNotify && confirmedOrders.length > 0)
            phoneToNotify = confirmedOrders[0].phone;

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

          // Use the PawaPay callback's requestedAmount + currency — this is already
          // converted to the customer's local currency (e.g. 56,650 RWF not $4.35 USD)
          const currency = body?.currency || "";
          const localAmount = body?.requestedAmount || body?.depositedAmount || tx.amount;
          const amountDisplay = `${localAmount} ${currency}`.trim();

          let msg = "";
          if (tx.type === "subscription") {
            msg = `Your Agatike Payment of ${amountDisplay} confirmed! Your Agatike subscription plan is now active. Manage your account at: https://agatike.com/dashboard`;
          } else if (tx.type === "space_subscription") {
            msg = `Your Agatike Payment of ${amountDisplay} confirmed! Your space subscription is now active. Visit: https://agatike.com/dashboard`;
          } else if (tx.type === "venue_booking") {
            msg = `Your Agatike Payment of ${amountDisplay} confirmed! Your venue booking is confirmed. Visit: https://agatike.com/dashboard`;
          } else {
            msg = `Your Agatike Payment of ${amountDisplay} confirmed! Thank you for your purchase. Visit your profile at: https://agatike.com/profile`;
          }

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
