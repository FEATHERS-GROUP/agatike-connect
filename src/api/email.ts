import { createServerFn } from "@tanstack/react-start";
export const sendAttendeeEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const {
      to,
      subject,
      message,
      eventName,
      organizerName,
      organizerLogo,
      organizerSocials,
      badgeLink,
      appUrl,
    } = ctx.data as any;

    const baseUrl = process.env.PROJECT_PRODUCTION_URL
      ? `https://${process.env.PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
          ? "https://agatike.rw"
          : appUrl || "https://agatike.com";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    // Build Social Links HTML if available
    let socialsHtml = "";
    if (organizerSocials && typeof organizerSocials === "object") {
      const socialLinks = Object.entries(organizerSocials)
        .filter(([_, url]) => url)
        .map(([platform, url]) => {
          let iconUrl = "https://img.icons8.com/ios-filled/24/666666/link--v1.png";
          if (platform.toLowerCase().includes("twitter") || platform.toLowerCase().includes("x"))
            iconUrl = "https://img.icons8.com/ios-filled/24/666666/twitter.png";
          else if (platform.toLowerCase().includes("instagram"))
            iconUrl = "https://img.icons8.com/ios-filled/24/666666/instagram-new.png";
          else if (platform.toLowerCase().includes("facebook"))
            iconUrl = "https://img.icons8.com/ios-filled/24/666666/facebook-new.png";
          else if (platform.toLowerCase().includes("linkedin"))
            iconUrl = "https://img.icons8.com/ios-filled/24/666666/linkedin.png";

          return `<a href="${url}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                  <img src="${iconUrl}" alt="${platform}" style="width: 24px; height: 24px;" />
                </a>`;
        })
        .join("");

      if (socialLinks) {
        socialsHtml = `
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #eaeaea; text-align: center;">
          <p style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 500;">Follow ${organizerName || "us"} on Social Media</p>
          <div>${socialLinks}</div>
        </div>
      `;
      }
    }

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Event Update</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">from ${organizerName || "your event organizer"}</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        ${eventName ? `<h3 style="margin-top: 0; color: #111; font-size: 18px; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 24px;">Regarding: ${eventName}</h3>` : ""}
        <div style="margin: 0;">${message}</div>
        
        ${
          badgeLink
            ? `
        <div style="margin-top: 32px; text-align: center; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <h4 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px;">Your Digital Badge</h4>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">Click below to open and save your digital badge. You can use it to check in at the event!</p>
          <a href="${badgeLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">View My Badge</a>
        </div>
        `
            : ""
        }

        ${socialsHtml}
      </div>
      
      <!-- Footer -->
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 24px 0; line-height: 1.5;">
          This message was sent securely by <strong>Agatike Connect</strong><br/>
          on behalf of ${organizerName || "the event organizer"}.
        </p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
          <tr>
            <td align="center">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  ${
                    organizerLogo &&
                    !organizerLogo.includes("localhost") &&
                    organizerLogo.startsWith("http")
                      ? `
                  <td align="center" style="padding-right: 16px; border-right: 1px solid #cbd5e1;">
                    <img src="${organizerLogo}" alt="${organizerName}" style="height: 40px; border-radius: 8px; object-fit: contain; display: block;" />
                  </td>
                  <td width="16"></td>
                  `
                      : ""
                  }
                  <td align="center">
                    <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; display: block;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="color: #F2571D; font-weight: 900; font-size: 16px; letter-spacing: 1px;">AGATIKE</div>
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: subject || `Update from ${organizerName}: ${eventName}`,
        html: html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send email via Resend");
    }
    return data;
  });

export const sendTicketsEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const {
      to,
      customerName,
      venueName,
      attachments, // Array of { filename: string, content: string (base64) }
    } = ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
          ? "https://agatike.rw"
          : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Your Tickets are Here!</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">for ${venueName}</p>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi ${customerName},</p>
        <p>Thank you for your booking! Your tickets are attached to this email as PDF documents.</p>
        <p>Please keep them handy as you will need the OTP printed on them for verification upon entry.</p>
        <br/>
        <p>Enjoy your visit!</p>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `Your Tickets for ${venueName}`,
        html: html,
        attachments: attachments,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send tickets via Resend");
    }
    return data;
  });

export const sendProfileUpdateOTP = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { to, otp } = ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
          ? "https://agatike.rw"
          : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Profile Update Verification</h2>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
        <p>You requested to update your profile information.</p>
        <p>Please use the following One-Time Password (OTP) to confirm your identity:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #F2571D; padding: 24px; background: #fff5f2; border-radius: 12px; display: inline-block; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666;">If you did not request this change, please ignore this email.</p>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `Your Profile Verification OTP: ${otp}`,
        html: html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send OTP via Resend");
    }
    return data;
  });

export const sendSubscriptionConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { to, customerName, spaceName, planName, price, billingCycle, startDate } =
      ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Booking Confirmed!</h2>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi ${customerName},</p>
        <p>Your booking for <strong>${spaceName}</strong> has been confirmed successfully!</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Booking Details</h3>
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 8px 0;"><strong>Billing Cycle:</strong> ${billingCycle}</p>
          <p style="margin: 8px 0;"><strong>Price:</strong> ${price}</p>
          ${startDate ? `<p style="margin: 8px 0;"><strong>Start Date:</strong> ${startDate}</p>` : ""}
        </div>
        <p>If you have any questions, feel free to contact the space organizer.</p>
        <div style="margin-top: 32px;">
          <a href="${baseUrl}/spaces/${spaceName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}" style="background-color: #f2571d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">View Space</a>
        </div>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `Booking Confirmed: ${spaceName}`,
        html: html,
      }),
    });

    const data = await res.json();
    console.log("Resend Subscription Confirmation API Response:", {
      status: res.status,
      ok: res.ok,
      data,
    });
    if (!res.ok) {
      throw new Error(data.message || "Failed to send confirmation email");
    }
    return data;
  });

export const sendSubscriptionInvoiceEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const {
      to,
      customerName,
      spaceName,
      planName,
      price,
      billingCycle,
      invoiceDate,
      invoiceNumber,
      startDate,
      pdfBase64,
    } = ctx.data as any;

    const baseUrl = process.env.PROJECT_PRODUCTION_URL
      ? `https://${process.env.PROJECT_PRODUCTION_URL}`
      : process.env.PROJECT_PRODUCTION_URL
        ? `https://${process.env.PROJECT_PRODUCTION_URL}`
        : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Payment Invoice</h2>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi ${customerName},</p>
        <p>Thank you for your payment. Your invoice for <strong>${spaceName}</strong> is attached to this email as a PDF.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
            <div>
              <p style="margin: 0; font-size: 14px; color: #64748b;">Invoice Number</p>
              <p style="margin: 4px 0 0 0; font-weight: 600;">${invoiceNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">Date Paid</p>
              <p style="margin: 4px 0 0 0; font-weight: 600;">${invoiceDate}</p>
            </div>
          </div>
          <p style="margin: 8px 0; display: flex; justify-content: space-between;">
            <span>${planName} (${billingCycle})</span>
            <strong>${price}</strong>
          </p>
          ${
            startDate
              ? `
          <p style="margin: 8px 0; display: flex; justify-content: space-between; font-size: 14px; color: #64748b;">
            <span>Start Date</span>
            <span>${startDate}</span>
          </p>`
              : ""
          }
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
            <span>Total Paid</span>
            <span>${price}</span>
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">📎 Your invoice PDF is attached. It includes a QR code for verification.</p>
        <p>Your subscription is now active. Keep this email for your records.</p>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
      </div>
    </div>
  `;

    const emailPayload: any = {
      from: "Agatike Connect <hello@agatike.rw>",
      to: [to],
      subject: `Invoice ${invoiceNumber} — ${spaceName}`,
      html: html,
      attachments: [],
    };

    // Attach pre-generated PDF if provided
    if (pdfBase64) {
      emailPayload.attachments.push({
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBase64,
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send invoice email");
    }
    return data;
  });

// Sends the company email with invoice PDF + member roster PDF attached
export const sendCompanyRosterEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const {
      to,
      companyName,
      spaceName,
      planName,
      price,
      billingCycle,
      startDate,
      invoiceNumber,
      invoiceDate,
      memberCount,
      members,
      pdfBase64,
    } = ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Group Booking Confirmed!</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 15px;">${spaceName}</p>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi <strong>${companyName}</strong>,</p>
        <p>Your group booking for <strong>${spaceName}</strong> has been confirmed.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Booking Summary</h3>
          <p style="margin: 8px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 8px 0;"><strong>Billing Cycle:</strong> ${billingCycle}</p>
          <p style="margin: 8px 0;"><strong>Total Price:</strong> ${price}</p>
          ${startDate ? `<p style="margin: 8px 0;"><strong>Start Date:</strong> ${startDate}</p>` : ""}
          <p style="margin: 8px 0; color: #f2571d; font-weight: 600;"><strong>Team Members:</strong> ${memberCount}</p>
        </div>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
        <div style="color: #F2571D; font-weight: 900; font-size: 14px; letter-spacing: 1px; margin-top: 8px;">AGATIKE</div>
      </div>
    </div>
  `;

    const attachments: any[] = [];

    // 1. Generate member roster CSV and attach it
    if (members && members.length > 0) {
      try {
        const { Buffer } = await import("buffer");
        const xlsContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th style="background-color: #f8fafc;">#</th>
                <th style="background-color: #f8fafc;">Full Name</th>
                <th style="background-color: #f8fafc;">Email</th>
                <th style="background-color: #f8fafc;">Phone</th>
                <th style="background-color: #f8fafc;">Membership ID</th>
              </tr>
            </thead>
            <tbody>
              ${members
                .map(
                  (m: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${m.name || ""}</td>
                  <td>${m.email || ""}</td>
                  <td>${m.phone || ""}</td>
                  <td style="font-family: monospace;">${m.membership_id || ""}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
        const xlsBase64 = Buffer.from(xlsContent, "utf-8").toString("base64");
        attachments.push({
          filename: `Member-Roster-${companyName.replace(/\s+/g, "-")}-${invoiceNumber}.xls`,
          content: xlsBase64,
        });
        console.log("[sendCompanyRosterEmail] XLS generated for", members.length, "members");
      } catch (xlsErr) {
        console.error("[sendCompanyRosterEmail] XLS generation FAILED:", xlsErr);
      }
    }

    // 2. Attach pre-generated invoice PDF if provided
    if (pdfBase64) {
      attachments.push({
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBase64,
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `Group Booking Confirmed: ${spaceName} — ${memberCount} Member(s)`,
        html,
        attachments,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send company roster email");
    return data;
  });

// Sends a personal welcome email to each individual team member
export const sendMemberWelcomeEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { to, memberName, companyName, spaceName, planName, startDate, membershipId } =
      ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to ${spaceName}!</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">Your membership is ready</p>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi <strong>${memberName}</strong>,</p>
        <p><strong>${companyName}</strong> has added you to their group membership at <strong>${spaceName}</strong>. Your membership starts on <strong>${startDate}</strong>.</p>

        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; padding: 24px; margin: 28px 0; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">Your Membership ID</p>
          <p style="color: #F2571D; font-size: 28px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace;">${membershipId}</p>
          <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 12px 0 0 0;">Show this at the front desk when you arrive</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 8px 0;"><strong>Space:</strong> ${spaceName}</p>
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 8px 0;"><strong>Start Date:</strong> ${startDate}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">Your membership is managed by <strong>${companyName}</strong>. If you have any questions, reach out to your team organizer.</p>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
        <div style="color: #F2571D; font-weight: 900; font-size: 14px; letter-spacing: 1px; margin-top: 8px;">AGATIKE</div>
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `Your Membership at ${spaceName} — ID: ${membershipId}`,
        html,
      }),
    });

    const data = await res.json();
    console.log("Resend Member Welcome API Response:", { status: res.status, ok: res.ok, data });
    if (!res.ok) throw new Error(data.message || "Failed to send member welcome email");
    return data;
  });

export const sendVisitorPassEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { to, visitorName, spaceName, visitDate, hostedBy, visitorId, pdfBase64 } =
      ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://agatike.rw";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #e11d48; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Your Visitor Pass</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">for ${spaceName}</p>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi <strong>${visitorName}</strong>,</p>
        <p>You have been registered as a visitor at <strong>${spaceName}</strong>.</p>

        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; padding: 24px; margin: 28px 0; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">Your Visitor ID</p>
          <p style="color: #e11d48; font-size: 28px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace;">${visitorId}</p>
          <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 12px 0 0 0;">Show this ID or your attached QR code at the front desk</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 8px 0;"><strong>Visit Date:</strong> ${visitDate}</p>
          <p style="margin: 8px 0;"><strong>Hosted By:</strong> ${hostedBy}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">📎 Your official Visitor Pass PDF is attached. Please keep it handy!</p>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
        <img src="${agatikeIconUrl}" alt="Agatike Icon" style="height: 40px; width: 40px; border-radius: 8px; object-fit: contain; margin: 0 auto; display: block;" />
        <div style="color: #F2571D; font-weight: 900; font-size: 14px; letter-spacing: 1px; margin-top: 8px;">AGATIKE</div>
      </div>
    </div>
  `;

    const emailPayload: any = {
      from: "Agatike Connect <hello@agatike.rw>",
      to: [to],
      subject: `Visitor Pass for ${spaceName}`,
      html: html,
      attachments: [],
    };

    if (pdfBase64) {
      emailPayload.attachments.push({
        filename: `VisitorPass-${visitorId}.pdf`,
        content: pdfBase64,
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send visitor pass email");
    return data;
  });


export const executeSendWorkspaceUserInviteEmail = async (data: any) => {
    const { to, userName, initialPassword, organizerName } = data;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "production"
          ? "https://agatike.rw"
          : "http://localhost:3000";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;
    const activationLink = `${baseUrl}/dashboard/workspace-user/${encodeURIComponent(to)}/activate`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">You've Been Invited!</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">to manage ${organizerName ? organizerName + "'s" : "a"} workspace</p>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>You have been invited to join a workspace on Agatike Connect. Your account has been provisioned.</p>

        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; padding: 24px; margin: 28px 0; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">Your Temporary Password</p>
          <p style="color: #F2571D; font-size: 28px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace;">${initialPassword}</p>
        </div>

        <p>To activate your account and set a permanent password, click the link below:</p>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${activationLink}" style="background-color: #f2571d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">Activate Account</a>
        </div>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `You've been invited to join ${organizerName || "a workspace"}`,
        html,
      }),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || "Failed to send invite email");
    return resData;
  };

export const sendWorkspaceUserInviteEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    return await executeSendWorkspaceUserInviteEmail(ctx.data);
  });

export const executeSendProjectAccessEmail = async (data: any) => {
  const { to, userName, organizerName, projectName, projectLink } = data;

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://agatike.rw"
        : "http://localhost:3000";

  const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;

  const html = `
  <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #0f172a; padding: 40px 24px; text-align: center;">
      <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
        <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Project Access Granted</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">by ${organizerName || "a workspace"}</p>
    </div>
    <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
      <p>Hi ${userName},</p>
      <p>You have been granted access to collaborate on the project <strong>${projectName}</strong>.</p>
      
      <p>Click the link below to open the project and start collaborating:</p>
      <div style="margin-top: 32px; text-align: center;">
        <a href="${projectLink}" style="background-color: #f2571d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">Open Project</a>
      </div>
    </div>
    <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
      <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
    </div>
  </div>
`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Agatike Connect <hello@agatike.rw>",
      to: [to],
      subject: `You have been granted access to ${projectName}`,
      html,
    }),
  });

  const resData = await res.json();
  if (!res.ok) throw new Error(resData.message || "Failed to send project access email");
  return resData;
};
