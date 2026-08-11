import crypto from "crypto";
import { hasuraRequest } from "./graphql.server";

export async function handleResendWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payloadString = await request.text();

    // Verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    if (secret && svixId && svixTimestamp && svixSignature) {
      // The signature is an HMAC-SHA256 of `svix-id.svix-timestamp.payload`
      const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64");
      const signedContent = `${svixId}.${svixTimestamp}.${payloadString}`;

      const hmac = crypto.createHmac("sha256", secretBytes);
      hmac.update(signedContent);
      const expectedSignature = hmac.digest("base64");

      // The svix-signature header contains a list of space-separated signatures in the format 'v1,SIGNATURE'
      const signatures = svixSignature.split(" ").map((s) => s.split(",")[1]);
      if (!signatures.includes(expectedSignature)) {
        console.error("Invalid Resend Webhook Signature");
        return new Response("Invalid signature", { status: 400 });
      }
    }

    const body = JSON.parse(payloadString);

    if (body.type === "email.received") {
      const { from, subject, text, html, attachments } = body.data;

      // Parse out the email address from 'Name <email@domain.com>'
      const emailMatch = from.match(/<([^>]+)>/);
      const senderEmail = emailMatch ? emailMatch[1].toLowerCase() : from.toLowerCase();

      // Find the lead by email
      const query = `
        query GetLeadByEmail($email: String!) {
          leads(where: { email: { _eq: $email } }, limit: 1) {
            id
            customer_profile
          }
        }
      `;
      const res = await hasuraRequest<{ leads: any[] }>(query, { email: senderEmail });
      let lead = res.leads?.[0];

      // Auto-create a lead if none exists — inbound email = potential sales opportunity
      if (!lead) {
        const inferredName = senderEmail
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase());

        const createMutation = `
          mutation CreateLeadFromInboundEmail($name: String!, $email: String!, $notes: String, $profile: jsonb) {
            insert_leads_one(object: {
              organizer_id: "00000000-0000-0000-0000-000000000000",
              name: $name,
              email: $email,
              notes: $notes,
              status: "new",
              customer_profile: $profile
            }) {
              id
              customer_profile
            }
          }
        `;

        const firstComm = {
          id: Date.now().toString(),
          type: "received",
          subject: subject,
          message: text || html || "No content",
          date: new Date().toISOString(),
          hasAttachments: !!(attachments && attachments.length > 0),
        };

        const createRes = await hasuraRequest<{
          insert_leads_one: { id: string; customer_profile: any };
        }>(createMutation, {
          name: inferredName,
          email: senderEmail,
          notes: `Auto-created from inbound email. Subject: ${subject}`,
          profile: { communications: [firstComm] },
        });

        lead = createRes.insert_leads_one;
        console.log(
          `Auto-created new lead for ${senderEmail} (id: ${lead?.id}) from inbound email.`,
        );
      } else {
        // Lead exists — append the email to their communication history
        const profile = lead.customer_profile || {};
        const communications = profile.communications || [];

        communications.push({
          id: Date.now().toString(),
          type: "received",
          subject: subject,
          message: text || html || "No content",
          date: new Date().toISOString(),
          hasAttachments: !!(attachments && attachments.length > 0),
        });

        const updateQuery = `
          mutation UpdateLeadProfile($id: uuid!, $profile: jsonb) {
            update_leads_by_pk(pk_columns: { id: $id }, _set: { customer_profile: $profile }) {
              id
            }
          }
        `;

        await hasuraRequest(updateQuery, {
          id: lead.id,
          profile: { ...profile, communications },
        });
        console.log(`Successfully logged incoming email from ${senderEmail} for lead ${lead.id}`);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("Resend webhook processing error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
