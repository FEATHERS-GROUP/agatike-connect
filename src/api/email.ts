import { createServerFn } from "@tanstack/react-start";

export const sendAttendeeEmail = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { to, subject, message, eventName, organizerName, organizerLogo, organizerSocials, badgeLink, appUrl } = ctx.data as any;

  // Header with Agatike Logo
  const agatikeIconUrl = appUrl ? `${appUrl}/agatike-icon.png` : "https://i.ibb.co/3sZqZqZ/agatike-logo.png";
  const agatikeLogoTextUrl = "https://ui-avatars.com/api/?name=Agatike&background=fff&color=F2571D&rounded=true"; // or another wordmark if available

  // Build Social Links HTML if available
  let socialsHtml = '';
  if (organizerSocials && typeof organizerSocials === 'object') {
    const socialLinks = Object.entries(organizerSocials)
      .filter(([_, url]) => url)
      .map(([platform, url]) => {
        let iconUrl = "https://img.icons8.com/ios-filled/24/666666/link--v1.png";
        if (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x')) iconUrl = "https://img.icons8.com/ios-filled/24/666666/twitter.png";
        else if (platform.toLowerCase().includes('instagram')) iconUrl = "https://img.icons8.com/ios-filled/24/666666/instagram-new.png";
        else if (platform.toLowerCase().includes('facebook')) iconUrl = "https://img.icons8.com/ios-filled/24/666666/facebook-new.png";
        else if (platform.toLowerCase().includes('linkedin')) iconUrl = "https://img.icons8.com/ios-filled/24/666666/linkedin.png";
        
        return `<a href="${url}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                  <img src="${iconUrl}" alt="${platform}" style="width: 24px; height: 24px;" />
                </a>`;
      }).join('');
      
    if (socialLinks) {
      socialsHtml = `
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #eaeaea; text-align: center;">
          <p style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 500;">Follow ${organizerName || 'us'} on Social Media</p>
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
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">from ${organizerName || 'your event organizer'}</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        ${eventName ? `<h3 style="margin-top: 0; color: #111; font-size: 18px; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 24px;">Regarding: ${eventName}</h3>` : ''}
        <div style="margin: 0;">${message}</div>
        
        ${badgeLink ? `
        <div style="margin-top: 32px; text-align: center; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <h4 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px;">Your Digital Badge</h4>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">Click below to open and save your digital badge. You can use it to check in at the event!</p>
          <a href="${badgeLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">View My Badge</a>
        </div>
        ` : ''}

        ${socialsHtml}
      </div>
      
      <!-- Footer -->
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 24px 0; line-height: 1.5;">
          This message was sent securely by <strong>Agatike Connect</strong><br/>
          on behalf of ${organizerName || 'the event organizer'}.
        </p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
          <tr>
            <td align="center">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  ${organizerLogo ? `
                  <td align="center" style="padding-right: 16px; border-right: 1px solid #cbd5e1;">
                    <img src="${organizerLogo}" alt="${organizerName}" style="height: 40px; border-radius: 8px; object-fit: contain; display: block;" />
                  </td>
                  <td width="16"></td>
                  ` : ''}
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
