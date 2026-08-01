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
      // 0. Idempotency Check: Prevent processing already completed transactions multiple times
      const txCheckQuery = `
        query CheckWalletTransaction($provider_reference: String!) {
          wallet_transactions(where: { provider_reference: { _eq: $provider_reference } }) {
            id
            status
          }
        }
      `;
      const txCheckRes = await hasuraRequest<{ wallet_transactions: any[] }>(txCheckQuery, {
        provider_reference: providerReference,
      });
      const existingTx = txCheckRes.wallet_transactions?.[0];

      if (existingTx && existingTx.status === "completed" && providerStatus === "COMPLETED") {
        console.log(
          `[PawaPay Webhook] Transaction ${providerReference} is already completed. Skipping duplicate processing.`,
        );
        return new Response(JSON.stringify({ received: true, message: "Already completed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

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
      let wsCity = "";
      let wsAddress = "";
      let wsThemeColor = "";
      let orgEmail = "";
      let orgPhone = "";

      if (tx?.workspace_id) {
        try {
          let targetSlug = "";
          if (tx.description && tx.description.includes("PawaPay Deposit::")) {
            targetSlug = tx.description.split("::")[1];
          }

          const wsQuery = targetSlug
            ? `query GetWS($id: uuid!, $slug: String!) { 
                workspaces_by_pk(id: $id) { name city address orgnizer_id } 
                workspace_pages(where: { workspace_id: { _eq: $id }, slug: { _eq: $slug } }, limit: 1) { slug theme_color components }
             }`
            : `query GetWS($id: uuid!) { 
                workspaces_by_pk(id: $id) { name city address orgnizer_id } 
                workspace_pages(where: { workspace_id: { _eq: $id } }, order_by: { updated_at: desc }, limit: 1) { slug theme_color components }
             }`;

          const wsData = await hasuraRequest<{
            workspaces_by_pk: { name: string; city: string; address: string; orgnizer_id: string };
            workspace_pages: { slug: string; theme_color: string; components: any }[];
          }>(
            wsQuery,
            targetSlug ? { id: tx.workspace_id, slug: targetSlug } : { id: tx.workspace_id },
          );
          if (wsData?.workspaces_by_pk) {
            wsName = wsData.workspaces_by_pk.name;
            wsCity = wsData.workspaces_by_pk.city || "";
            wsAddress = wsData.workspaces_by_pk.address || "";

            if (wsData.workspaces_by_pk.orgnizer_id) {
              const orgData = await hasuraRequest<{
                organizers_by_pk: { email: string; phone: string };
              }>(`query GetOrg($id: uuid!) { organizers_by_pk(id: $id) { email phone } }`, {
                id: wsData.workspaces_by_pk.orgnizer_id,
              });
              if (orgData?.organizers_by_pk) {
                orgEmail = orgData.organizers_by_pk.email || "";
                orgPhone = orgData.organizers_by_pk.phone || "";
              }
            }
          }
          if (wsData?.workspace_pages?.length) {
            wsSlug = wsData.workspace_pages[0].slug;
            let dbTheme = wsData.workspace_pages[0].theme_color;
            const components = wsData.workspace_pages[0].components;
            if (components && Array.isArray(components)) {
              const settingsBlock = components.find((b: any) => b.type === "settings");
              if (settingsBlock?.themeColor) dbTheme = settingsBlock.themeColor;
            }
            wsThemeColor = dbTheme || "";
            console.log("[PawaPay Webhook] EXTRACTED THEME COLOR:", wsThemeColor);
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

      if (tx && tx.status === "completed") {
        if (
          tx.type === "event_ticket" ||
          tx.type === "portal_event_ticket" ||
          tx.type?.startsWith("page_builder_checkout")
        ) {
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
                  ticket_id
                  custom_fields
                  events {
                    id
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

          if (confirmedAttendees.length > 0) {
            try {
              const { processSponsoredVouchersForAttendees } = await import("./sponsored_vouchers");
              await processSponsoredVouchersForAttendees(confirmedAttendees);
            } catch (e) {
              console.error("[PawaPay] Failed to process sponsored vouchers:", e);
            }
          }

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
                  amount_paid
                  qr_code_string
                  phone
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
          let appUrl = process.env.PROJECT_PRODUCTION_URL
            ? `https://${process.env.PROJECT_PRODUCTION_URL}`
            : "https://agatike.com";

          if (wsSlug) {
            appUrl = `https://${wsSlug}.${process.env.PROJECT_PRODUCTION_URL || "agatike.com"}`;
          }

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
          // ── NOTIFICATIONS (Skipped for Web Portal Checkouts) ──
          if (!tx.type?.startsWith("portal_")) {
            const orgName = firstAtt?.events?.workspaces?.name || wsName || domain;

            const totalPaidStr = body?.depositedAmount
              ? body.depositedAmount
              : (parseFloat(tx.amount) + customerFee).toString();

            let detailedMessage = "";
            let shortSmsMessage = "";

            if (firstAtt) {
              // Ticket purchase
              detailedMessage =
                `Payment of ${totalPaidStr} ${body?.currency || ""} ${feeText ? `(${feeText}) ` : ""}confirmed! Thank you for purchasing ${ticketCodes} for ${eventName}. ` +
                `\n\nOrganizer: ${orgName}\nDate: ${dateStr}\nVenue: ${eventLocation}\n` +
                (productsText ? `\nProducts: ${productsText}` : "");
              shortSmsMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} confirmed! Tickets: ${ticketCodes}. View at: ${appUrl}/ticket/${firstAtt?.id}`;
            } else if (confirmedOrders.length > 0) {
              // Product-only purchase
              detailedMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} ${feeText ? `(${feeText}) ` : ""}confirmed! You purchased: ${productsText}. Order Ref: ${productQrCode || "N/A"}. Thank you for shopping with ${orgName}!`;
              shortSmsMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} confirmed! You bought: ${productsText}. Ref: ${productQrCode || "N/A"}`;
            } else {
              // General page builder payment
              detailedMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} ${feeText ? `(${feeText}) ` : ""}confirmed! Thank you for your payment to ${domain}.`;
              shortSmsMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} confirmed! Thank you for your payment to ${domain}.`;
            }

            if (firstAtt) {
              const { sendAttendeeEmail } = await import("./email");

              const emailAddresses = [
                ...new Set(confirmedAttendees.map((a: any) => a.email).filter(Boolean)),
              ];

              let fallbackPdfBase64: string | undefined = undefined;
              if (firstAtt.events?.id) {
                try {
                  const { generateFallbackReceipt } = await import("../lib/pdf-receipt");

                  // Extract time separately for layout
                  const tourStops = Array.isArray(firstAtt.events.tour_stops)
                    ? firstAtt.events.tour_stops
                    : firstAtt.events.tour_stops
                      ? [firstAtt.events.tour_stops]
                      : [];
                  const firstStop = tourStops[0] || {};

                  const fallbackRes = await generateFallbackReceipt({
                    entityName: orgName,
                    customerName: firstAtt.names,
                    ticket: { id: firstAtt.qrcode_number, tier: "Event Ticket" },
                    dateStr: firstStop.date || "TBD",
                    timeStr: firstStop.time || "TBD",
                    locationStr: eventLocation,
                    bookingRef: tx.reference_id,
                  });
                  fallbackPdfBase64 = fallbackRes.content;
                } catch (e) {
                  console.error("Failed to generate fallback ticket", e);
                }
              }

              const attachments: any[] = [];
              if (fallbackPdfBase64) {
                attachments.push({
                  filename: `Ticket-${firstAtt.qrcode_number}.pdf`,
                  content: fallbackPdfBase64,
                  contentType: "application/pdf",
                });
              }

              let productPdfBase64: string | undefined = undefined;
              if (confirmedOrders.length > 0) {
                try {
                  const { generateProductReceiptPdf, generateVoucherPdf } =
                    await import("./receipts");
                  const orgDetails = {
                    name: eventName || wsName || domain,
                    email: orgEmail,
                    phone: orgPhone,
                    city: wsCity,
                    address: wsAddress,
                    themeColor: wsThemeColor,
                  };
                  let customerDetails = {
                    name: firstAtt?.names || "",
                    email: guestEmail,
                    phone: body?.payer?.address?.value || "",
                  };
                  const pdfBuffer = await generateProductReceiptPdf(
                    confirmedOrders,
                    orgDetails,
                    customerDetails,
                    customerFee,
                  );
                  productPdfBase64 = pdfBuffer.toString("base64");
                  if (productPdfBase64) {
                    attachments.push({
                      filename: `Receipt-${productQrCode || "Order"}.pdf`,
                      content: productPdfBase64,
                      contentType: "application/pdf",
                    });
                  }

                  for (const order of confirmedOrders) {
                    if (order.product?.type === "voucher") {
                      const vBuffer = await generateVoucherPdf(order, orgDetails);
                      attachments.push({
                        filename: `Voucher-${order.qr_code_string || "GiftCard"}.pdf`,
                        content: vBuffer.toString("base64"),
                        contentType: "application/pdf",
                      });
                    }
                  }
                } catch (e) {
                  console.error("Failed to generate product receipt PDF", e);
                }
              }

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
                    attachments,
                  },
                } as any).catch((e) => console.error("Failed to send attendee email", e));
              }
            } else if (confirmedOrders.length > 0 && guestEmail) {
              // Product-only purchase email receipt
              const { sendAttendeeEmail } = await import("./email");

              const attachments: any[] = [];
              let productPdfBase64: string | undefined = undefined;
              try {
                const { generateProductReceiptPdf, generateVoucherPdf } =
                  await import("./receipts");
                const orgDetails = {
                  name: eventName || wsName || domain,
                  email: orgEmail,
                  phone: orgPhone,
                  city: wsCity,
                  address: wsAddress,
                  themeColor: wsThemeColor,
                };
                let phoneToNotify = body?.payer?.address?.value;
                if (!phoneToNotify && firstAtt?.phone) phoneToNotify = firstAtt.phone;
                if (!phoneToNotify && confirmedOrders.length > 0)
                  phoneToNotify = confirmedOrders[0].phone;
                let customerDetails = {
                  name: firstAtt?.names || "Guest",
                  email: guestEmail || firstAtt?.email || "",
                  phone: phoneToNotify || "",
                };
                const pdfBuffer = await generateProductReceiptPdf(
                  confirmedOrders,
                  orgDetails,
                  customerDetails,
                  customerFee,
                );
                productPdfBase64 = pdfBuffer.toString("base64");
                if (productPdfBase64) {
                  attachments.push({
                    filename: `Receipt-${productQrCode || "Order"}.pdf`,
                    content: productPdfBase64,
                    contentType: "application/pdf",
                  });
                }

                for (const order of confirmedOrders) {
                  if (order.product?.type === "voucher") {
                    const vBuffer = await generateVoucherPdf(order, orgDetails);
                    attachments.push({
                      filename: `Voucher-${order.qr_code_string || "GiftCard"}.pdf`,
                      content: vBuffer.toString("base64"),
                      contentType: "application/pdf",
                    });
                  }
                }
              } catch (e) {
                console.error("Failed to generate product receipt PDF", e);
              }

              await sendAttendeeEmail({
                data: {
                  to: guestEmail,
                  subject: `Your purchase from ${orgName} is confirmed!`,
                  message: detailedMessage,
                  eventName: "Product Store",
                  organizerName: orgName,
                  appUrl,
                  attachments,
                },
              } as any).catch((e) => console.error("Failed to send product email", e));
            }

            // Send Event SMS with direct ticket links and products
            let phoneToNotify = body?.payer?.address?.value;
            if (!phoneToNotify && firstAtt?.phone) phoneToNotify = firstAtt.phone;
            if (!phoneToNotify && confirmedOrders.length > 0)
              phoneToNotify = confirmedOrders[0].phone;

            if (phoneToNotify) {
              const { sendSMS } = await import("./pindo.server");
              try {
                await sendSMS(phoneToNotify, shortSmsMessage);
              } catch (e) {
                console.error("[Pindo SMS] Failed to send payment confirmation:", e);
              }
            }
          } // End of Notifications block
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
        } else if (tx.type === "venue_booking" || tx.type === "portal_venue_booking") {
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
                  where: {
                    _or: [
                      { tickets_data: { _contains: { payment_ref: $ref } } },
                      { tickets_data: { _contains: { summary: { payment_ref: $ref } } } }
                    ]
                  },
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
        if (
          tx.type !== "event_ticket" &&
          tx.type !== "portal_event_ticket" &&
          !tx.type?.startsWith("page_builder_checkout") &&
          body?.payer?.address?.value
        ) {
          const phone = body.payer.address.value;
          const { sendSMS } = await import("./pindo.server");

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
          } else if (tx.type === "venue_booking" || tx.type === "portal_venue_booking") {
            try {
              const bookingId = tx.reference_id?.split(",")[0];
              if (bookingId) {
                const { hasuraRequest } = await import("./graphql.server");
                const bData = await hasuraRequest<{ venue_bookings_by_pk: any }>(
                  `query GetB($id: uuid!) { 
                     venue_bookings_by_pk(id: $id) { 
                       start_time end_time tickets_data facility_id
                       rentable_venue { name address city facilities_data } 
                     } 
                   }`,
                  { id: bookingId }
                );
                const bk = bData?.venue_bookings_by_pk;
                if (bk) {
                  let fName = "";
                  if (bk.facility_id && bk.rentable_venue?.facilities_data) {
                    const facilities = bk.rentable_venue.facilities_data || [];
                    const fac = facilities.find((f: any) => f.id === bk.facility_id);
                    if (fac && fac.name) {
                      fName = fac.name;
                    }
                  }
                  
                  const vName = bk.rentable_venue?.name || "Venue";
                  const bRef = bk.tickets_data?.booking_ref || "";
                  const sDate = new Date(bk.start_time);
                  const eDate = new Date(bk.end_time);
                  
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const dateStr = `${monthNames[sDate.getMonth()]} ${sDate.getDate()}`;
                  
                  const formatTime = (d: Date) => {
                    let h = d.getHours();
                    const m = (d.getMinutes()<10?'0':'') + d.getMinutes();
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    h = h % 12;
                    h = h ? h : 12;
                    return `${h}:${m} ${ampm}`;
                  };
                  
                  const sTime = formatTime(sDate);
                  const eTime = formatTime(eDate);
                  const loc = bk.rentable_venue?.address || bk.rentable_venue?.city || "Venue";
                  
                  const what = fName ? `${fName} at ${vName}` : vName;
                  msg = `Payment ${amountDisplay} received. Confirmed: ${what}. Code: ${bRef}. Time: ${dateStr}, ${sTime}-${eTime}. Loc: ${loc}`;
                }
              }
            } catch (e) {
              console.error("Failed to fetch venue booking for SMS", e);
            }
            if (!msg) {
              msg = `Your Agatike Payment of ${amountDisplay} confirmed! Your venue booking is confirmed.`;
            }
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
