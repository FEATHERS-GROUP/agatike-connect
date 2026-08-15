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
    const providerReference = body.depositId || body.payoutId || body.refundId;
    const providerStatus = body.status;

    if (providerReference) {
      // Atomic idempotency: only update if NOT already in a terminal state.
      // If affected_rows === 0, this webhook is a duplicate and we skip processing.
      const updateQuery = `
        mutation UpdateWalletTransaction($provider_reference: String!, $provider_status: String!, $status: String!, $raw_callback_data: jsonb) {
          update_wallet_transactions(
            where: { 
              provider_reference: { _eq: $provider_reference },
              status: { _nin: ["completed", "failed"] }
            }, 
            _set: { 
              provider_status: $provider_status, 
              status: $status,
              raw_callback_data: $raw_callback_data,
              updated_at: "now()"
            }
          ) {
            affected_rows
            returning {
              id
              status
              reference_id
              type
              amount
              net_amount
              workspace_id
              currency
              payout_method
              payout_account
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
            : providerStatus === "FAILED" ||
                providerStatus === "REJECTED" ||
                providerStatus === "REVERSED"
              ? "failed"
              : "pending",
        raw_callback_data: body,
      });

      const affectedRows = res.update_wallet_transactions?.affected_rows ?? 0;

      if (affectedRows === 0) {
        // Either already completed/failed, or unknown reference — skip duplicate processing
        return new Response(JSON.stringify({ received: true, message: "Already processed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

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
          if (tx.description && tx.description.includes("Agatike Deposit::")) {
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
                  event_tickets {
                    cost
                  }
                  events {
                    id
                    title
                    tour_stops
                    workspaces {
                      name
                    }
                    ticket_projects(where: { deleted: { _eq: false } }) {
                      template
                      palette
                      font
                      coverImage
                      logoText
                      logoImage
                      logoColorMode
                      logoScale
                      logoOpacity
                      design_overrides
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
                    type
                    specs
                    workspace {
                      currency
                      wallet {
                        currency
                      }
                    }
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
          let dateStr = "Upcoming";
          let eventLocation = "";

          if (firstAtt?.events) {
            eventName = firstAtt.events.title || eventName;
            const tourStops = Array.isArray(firstAtt.events.tour_stops)
              ? firstAtt.events.tour_stops
              : firstAtt.events.tour_stops
                ? [firstAtt.events.tour_stops]
                : [];
            const firstStop = tourStops[0] || {};
            dateStr = `${firstStop.date || "Upcoming"} ${firstStop.time || ""}`.trim();
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

            let digitalDownloadsText = "";
            const digitalOrders = confirmedOrders.filter((o: any) => o.product?.type === 'digital' && o.product?.specs?.digital_file_url);
            if (digitalOrders.length > 0) {
              const downloadBaseUrl = `https://${domain}/d/`;
              const downloadLinksHtml = digitalOrders.map((o: any) => `
                <div style="margin-top: 12px; margin-bottom: 12px;">
                  <a href="${downloadBaseUrl}${o.id}" style="display:inline-block; padding:12px 24px; background-color:#F2571D; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
                    Download ${o.product.name}
                  </a>
                </div>
              `).join("");

              digitalDownloadsText = `<div style="background-color: #fff3ed; border: 1px solid #ffd8c4; padding: 20px; border-radius: 12px; margin-top: 24px; text-align: center;">
                <h4 style="margin-top: 0; margin-bottom: 12px; color: #d94916; font-size: 16px;">Your Digital Products</h4>
                <p style="margin-bottom: 16px; font-size: 14px; color: #555;">Click below to securely download your files.</p>
                ${downloadLinksHtml}
                <p style="margin-top: 16px; margin-bottom: 0; font-size: 12px; color: #d94916; font-weight: 600;">
                  Security Notice: Link expires exactly 24 hours after purchase and can only be used once.
                </p>
              </div>`;
            }

            if (firstAtt) {
              // Ticket purchase
              detailedMessage =
                `Payment of ${totalPaidStr} ${body?.currency || ""} ${feeText ? `(${feeText}) ` : ""}confirmed! Thank you for purchasing ${ticketCodes} for ${eventName}. ` +
                `<br><br><strong>Organizer:</strong> ${orgName}<br><strong>Date:</strong> ${dateStr}<br><strong>Venue:</strong> ${eventLocation}<br>` +
                (productsText ? `<br><strong>Products:</strong> ${productsText}` : "") + digitalDownloadsText;
              shortSmsMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} confirmed! Tickets: ${ticketCodes}. View at: ${appUrl}/ticket/${firstAtt?.id}`;
            } else if (confirmedOrders.length > 0) {
              // Product-only purchase
              detailedMessage = `Payment of ${totalPaidStr} ${body?.currency || ""} ${feeText ? `(${feeText}) ` : ""}confirmed! You purchased: ${productsText}. Order Ref: ${productQrCode || "N/A"}. Thank you for shopping with ${orgName}!${digitalDownloadsText}`;
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

              const attachments: any[] = [];
              if (confirmedAttendees.length > 0) {
                try {
                  const { generateFallbackReceipt } = await import("../lib/pdf-receipt");
                  const { getMergedProjectDesign } = await import("./user_tickets");

                  for (const att of confirmedAttendees) {
                    if (!att.events?.id) continue;

                    const tourStops = Array.isArray(att.events.tour_stops)
                      ? att.events.tour_stops
                      : att.events.tour_stops
                        ? [att.events.tour_stops]
                        : [];
                    const firstStop = tourStops[0] || {};

                    const baseProject = att.events?.ticket_projects?.[0];
                    const mergedDesign = baseProject
                      ? getMergedProjectDesign(baseProject, 0, att.ticket_id)
                      : undefined;

                    const seatData = att.custom_fields?.seat || att.custom_fields?.section || "";
                    const hasRealSeat = !!seatData;
                    const seatStr = seatData || att.names || "General";
                    const seatLabelStr = hasRealSeat ? "Seat" : "Name";

                    const ticketCost = Number(att.event_tickets?.cost) || mergedDesign?.price || 0;
                    const currency = att.events.workspaces?.currency || att.events.workspaces?.wallet?.currency || "RWF";

                    const fallbackRes = await generateFallbackReceipt({
                      entityName: orgName,
                      customerName: att.names,
                      ticket: {
                        id: att.qrcode_number,
                        tier: att.ticket_type || "Event Ticket",
                        price: ticketCost,
                        currency: currency,
                        seat: seatStr,
                        seatLabel: seatLabelStr,
                        design: mergedDesign,
                      },
                      dateStr: firstStop.date || "",
                      timeStr: firstStop.time || "",
                      locationStr: eventLocation || "",
                      bookingRef: tx.reference_id,
                      type: "event",
                    });

                    attachments.push({
                      filename: `Ticket-${att.qrcode_number}.pdf`,
                      content: fallbackRes.content,
                      contentType: "application/pdf",
                    });
                  }
                } catch (e) {
                  console.error("Failed to generate fallback tickets", e);
                }
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
                    parseFloat(totalPaidStr || "0"),
                    firstAtt?.events?.workspaces?.currency || firstAtt?.events?.workspaces?.wallet?.currency || body?.baseCurrency || "RWF",
                    body?.currency || "RWF"
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
                      const vBuffer = await generateVoucherPdf(
                        order, 
                        orgDetails, 
                        firstAtt?.events?.workspaces?.currency || firstAtt?.events?.workspaces?.wallet?.currency || body?.baseCurrency || "RWF"
                      );
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
                  parseFloat(totalPaidStr || "0"),
                  body?.baseCurrency || "RWF",
                  body?.currency || "RWF"
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
                    const vBuffer = await generateVoucherPdf(
                      order, 
                      orgDetails,
                      body?.baseCurrency || "RWF"
                    );
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
          // Activate the subscription
          const activateSubRes = await hasuraRequest<{ update_space_subscriptions_by_pk: any }>(
            `mutation ActivateSpaceSubscription($id: uuid!) {
              update_space_subscriptions_by_pk(
                pk_columns: { id: $id },
                _set: { status: "active" }
              ) {
                id
                customer_name
                customer_email
                customer_phone
                plan_name
                price
                billing_cycle
                start_date
                booking_type
                team_members
                space_id
                space {
                  name
                  description
                  currency
                  workspace {
                    currency
                    wallet {
                      currency
                    }
                  }
                }
              }
            }`,
            { id: tx.reference_id },
          );

          const sub = activateSubRes?.update_space_subscriptions_by_pk;

          if (sub) {
            // Generate Invoice & Send Emails (just like Checkout does)
            try {
              const { createInvoiceRecord } = await import("./invoices");
              const {
                sendSubscriptionConfirmationEmail,
                sendSubscriptionInvoiceEmail,
                sendCompanyRosterEmail,
                sendMemberWelcomeEmail,
              } = await import("./email");

              const currency = sub.space?.workspace?.currency || sub.space?.workspace?.wallet?.currency || body?.currency || "RWF";
              const priceDisplay = `${currency} ${Number(sub.price || 0).toLocaleString()}`;
              const groupPlanName =
                sub.booking_type === "group" && sub.team_members
                  ? `${sub.plan_name} (Group of ${sub.team_members.length})`
                  : sub.plan_name;

              const invoice = await createInvoiceRecord({
                data: {
                  spaceName: sub.space?.name || "Our Space",
                  customerName: sub.customer_name,
                  customerEmail: sub.customer_email,
                  planName: groupPlanName,
                  amount: String(sub.price || 0),
                  currency,
                  billingCycle: sub.billing_cycle,
                  startDate: sub.start_date,
                  spaceId: sub.space_id,
                  referenceId: sub.id,
                },
              } as any);

              const invoiceNumber = invoice?.invoiceNumber || `AGT-${Date.now()}`;
              const pdfBase64 = invoice?.pdfBase64 || null;
              const invoiceDate = new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              });

              const formattedStart = sub.start_date
                ? new Date(sub.start_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : sub.start_date;

              if (sub.booking_type === "group" && sub.team_members && sub.team_members.length > 0) {
                // Send group company email
                await sendCompanyRosterEmail({
                  data: {
                    to: sub.customer_email,
                    companyName: sub.customer_name,
                    spaceName: sub.space?.name || "Our Space",
                    planName: groupPlanName,
                    price: priceDisplay,
                    billingCycle: sub.billing_cycle,
                    startDate: formattedStart,
                    invoiceNumber,
                    invoiceDate,
                    memberCount: sub.team_members.length,
                    members: sub.team_members,
                    pdfBase64,
                  },
                } as any);

                // Welcome each member
                for (const m of sub.team_members) {
                  if (m.email) {
                    await sendMemberWelcomeEmail({
                      data: {
                        to: m.email,
                        memberName: m.name,
                        companyName: sub.customer_name,
                        spaceName: sub.space?.name || "Our Space",
                        planName: sub.plan_name,
                        startDate: formattedStart,
                        membershipId: m.membership_id || "—",
                      },
                    } as any).catch((e) =>
                      console.error("Error sending welcome email to group member:", e),
                    );
                  }
                }
              } else {
                // Individual Booking — send confirmation with invoice PDF attached
                await sendSubscriptionConfirmationEmail({
                  data: {
                    to: sub.customer_email,
                    customerName: sub.customer_name,
                    spaceName: sub.space?.name || "Our Space",
                    planName: sub.plan_name,
                    price: priceDisplay,
                    billingCycle: sub.billing_cycle,
                    startDate: sub.start_date,
                    pdfBase64, // attach invoice PDF directly
                    invoiceNumber,
                  },
                } as any);
              }
            } catch (err) {
              console.error("[PawaPay Webhook] Failed to process/send subscription emails:", err);
            }

            // Send rich SMS to subscriber
            const subPhone = body?.payer?.address?.value || sub?.customer_phone;
            if (subPhone) {
              const currency = body?.currency || "";
              const localAmount = body?.requestedAmount || body?.depositedAmount || tx.amount;
              const spaceName = sub.space?.name || "the space";
              const planName = sub.plan_name || "your plan";
              const startDate = sub.start_date
                ? new Date(sub.start_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "today";

              const smsText =
                `Booking Confirmed! Hi ${sub.customer_name || "there"}, your subscription to ${spaceName} is now active.\n` +
                `Plan: ${planName}\n` +
                `Start Date: ${startDate}\n` +
                `Amount Paid: ${localAmount} ${currency}\n` +
                `Thank you for choosing ${wsName || spaceName}!`;

              try {
                const { sendSMS } = await import("./pindo.server");
                await sendSMS(subPhone, smsText);
                console.log(`[Pindo SMS] Space subscription confirmation sent to ${subPhone}`);
              } catch (e) {
                console.error("[Pindo SMS] Failed to send space subscription SMS:", e);
              }
            }
          }
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
        if (
          tx.workspace_id &&
          tx.net_amount &&
          tx.type !== "subscription" &&
          tx.type !== "withdrawal"
        ) {
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
                       rentable_venue { name address city facilities_data opening_hours closing_hours } 
                     } 
                   }`,
                  { id: bookingId },
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
                  let bRef = "";
                  if (bk.tickets_data?.issued && bk.tickets_data.issued.length > 0) {
                    bRef = bk.tickets_data.issued.map((t: any) => t.otp).join(", ");
                  } else {
                    bRef =
                      bk.tickets_data?.summary?.booking_ref || bk.tickets_data?.booking_ref || "";
                  }
                  const sDate = new Date(bk.start_time);
                  const eDate = new Date(bk.end_time);

                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  const dateStr = `${monthNames[sDate.getMonth()]} ${sDate.getDate()}`;

                  const formatTime = (d: Date) => {
                    let h = d.getHours();
                    const m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
                    const ampm = h >= 12 ? "PM" : "AM";
                    h = h % 12;
                    h = h ? h : 12;
                    return `${h}:${m} ${ampm}`;
                  };

                  let sTime = formatTime(sDate);
                  let eTime = formatTime(eDate);

                  if (!fName && bk.rentable_venue) {
                    const parseHour = (hStr: string) => {
                      if (!hStr) return null;
                      const [hh, mm] = hStr.split(":");
                      if (!hh) return null;
                      let h = parseInt(hh, 10);
                      const ampm = h >= 12 ? "PM" : "AM";
                      h = h % 12;
                      h = h ? h : 12;
                      return `${h}:${mm || "00"} ${ampm}`;
                    };
                    const open = parseHour(bk.rentable_venue.opening_hours);
                    const close = parseHour(bk.rentable_venue.closing_hours);
                    if (open && close) {
                      sTime = open;
                      eTime = close;
                    }
                  }

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

      // 3. Handle Successful Withdrawals
      if (tx && tx.status === "completed" && tx.type === "withdrawal") {
        if (tx.workspace_id) {
          try {
            // 1. Get Workspace / Organizer Details
            const wsQuery = `
              query GetWorkspaceInfo($id: uuid!) {
                workspaces_by_pk(id: $id) {
                  id
                  name
                  orgnizer_id
                  organizer {
                    id
                    email
                    phone
                    name
                  }
                  wallet {
                    id
                    amount
                  }
                }
              }
            `;
            const wsRes = await hasuraRequest<{ workspaces_by_pk: any }>(wsQuery, {
              id: tx.workspace_id,
            });
            const ws = wsRes.workspaces_by_pk;

            if (ws && ws.organizer) {
              const { email, phone, name } = ws.organizer;
              const organizerName = name || ws.name || "Organizer";
              const currentBalance = ws.wallet?.amount || 0;
              const netPayout = parseFloat(tx.net_amount) || parseFloat(tx.amount);

              // 2. Generate PDF Receipt
              const { generateWithdrawalReceipt } = await import("../lib/pdf-withdrawal-receipt");
              const receipt = await generateWithdrawalReceipt({
                amount: parseFloat(tx.amount),
                netAmount: netPayout,
                currency: tx.currency,
                payoutMethod: tx.payout_method || "momo",
                payoutAccount: tx.payout_account || "Unknown",
                referenceId: tx.reference_id || tx.id,
                date: new Date(),
                organizerName,
              });

              // 3. Send Email via Resend with PDF Attachment
              if (email && process.env.RESEND_API_KEY) {
                await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    from: "Agatike Connect <finance@agatike.rw>",
                    to: [email],
                    subject: `Withdrawal Successful: ${netPayout} ${tx.currency}`,
                    html: `<p>Hello ${organizerName},</p><p>Your withdrawal of <strong>${netPayout} ${tx.currency}</strong> was successfully completed and sent to your account (${tx.payout_account}).</p><p>Please find your receipt attached.</p>`,
                    attachments: [
                      {
                        filename: receipt.filename,
                        content: receipt.content,
                      },
                    ],
                  }),
                });
              }

              // 4. Send SMS
              if (phone) {
                const { sendSMS } = await import("./pindo.server");
                const smsText = `Agatike Connect: Your withdrawal of ${netPayout} ${tx.currency} was successful. Ref: ${tx.reference_id || tx.id}. Remaining Balance: ${currentBalance} ${tx.currency}.`;
                await sendSMS(phone, smsText, ws.orgnizer_id);
              }

              // 5. Firebase Notification (Firestore)
              const { getFirebaseAdmin } = await import("../lib/firebase.server");
              const admin = await getFirebaseAdmin();
              if (admin && admin.db) {
                const db = admin.db;
                await db.collection("agatike_notifications").add({
                  actorId: null,
                  actorName: "System",
                  createdAt: new Date().toISOString(),
                  message: `Withdrawal of ${netPayout} ${tx.currency} to account ${tx.payout_account} was successfully withdrawn.`,
                  organizerId: ws.orgnizer_id,
                  read: false,
                  title: "Withdrawal Successful",
                  type: "withdrawal",
                  targetId: tx.reference_id || tx.id,
                });
              }
            }
          } catch (e) {
            console.error("[PawaPay Webhook] Failed to send withdrawal notifications:", e);
          }
        }
      }

      // 4. Handle Failed Withdrawals (Refund the wallet)
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

          try {
            const wsQuery = `
              query GetWorkspaceInfo($id: uuid!) {
                workspaces_by_pk(id: $id) {
                  orgnizer_id
                }
              }
            `;
            const wsRes = await hasuraRequest<{ workspaces_by_pk: any }>(wsQuery, {
              id: tx.workspace_id,
            });
            const ws = wsRes.workspaces_by_pk;

            if (ws && ws.orgnizer_id) {
              const { getFirebaseAdmin } = await import("../lib/firebase.server");
              const admin = await getFirebaseAdmin();
              if (admin && admin.db) {
                const db = admin.db;
                await db.collection("agatike_notifications").add({
                  actorId: null,
                  actorName: "System",
                  createdAt: new Date().toISOString(),
                  message: `Withdrawal of ${tx.amount} ${tx.currency || "RWF"} to account ${tx.payout_account || "account"} failed and has been fully refunded to your wallet.`,
                  organizerId: ws.orgnizer_id,
                  read: false,
                  title: "Withdrawal Failed",
                  type: "withdrawal",
                  targetId: tx.reference_id || tx.id,
                });
              }
            }
          } catch (e) {
            console.error("[PawaPay Webhook] Failed to send failed withdrawal notification:", e);
          }
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
