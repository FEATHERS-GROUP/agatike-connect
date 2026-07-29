import { createAPIFileRoute } from "@tanstack/react-start/api";
import { hasuraRequest } from "@/api/graphql.server";
import crypto from "crypto";

export const APIRoute = createAPIFileRoute("/api/resend/inbound")({
  POST: async ({ request }) => {
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
        const signatures = svixSignature.split(" ").map(s => s.split(",")[1]);
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
        const lead = res.leads?.[0];

        if (lead) {
          const profile = lead.customer_profile || {};
          const communications = profile.communications || [];

          communications.push({
            id: Date.now().toString(),
            type: "received",
            subject: subject,
            message: text || html || "No content",
            date: new Date().toISOString(),
            hasAttachments: !!(attachments && attachments.length > 0)
          });

          const updateQuery = `
            mutation UpdateLeadProfile($id: uuid!, $profile: jsonb) {
              update_leads_by_pk(pk_columns: { id: $id }, _set: { customer_profile: $profile }) {
                id
              }
            }
          `;
          
          await hasuraRequest(updateQuery, { id: lead.id, profile: { ...profile, communications } });
          console.log(`Successfully logged incoming email from ${senderEmail} for lead ${lead.id}`);
        } else {
          console.log(`Incoming email from ${senderEmail} ignored: No matching lead found.`);
        }
      }

      return new Response("OK", { status: 200 });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});
