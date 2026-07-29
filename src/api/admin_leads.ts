import { createServerFn } from "@tanstack/react-start";
import { getAdminSession } from "./admin_auth";
import { hasuraRequest } from "./graphql.server";

export type Lead = {
  id: string;
  organizer_id: string;
  plan_id: string | null;
  name: string;
  email: string;
  company: string | null;
  communication_method: string | null;
  language: string | null;
  country: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  customer_profile: any;
  created_at: string;
  updated_at: string;
};

export const getAdminLeads = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");

  const query = `
    query GetAdminLeads {
      leads(order_by: { created_at: desc }) {
        id
        organizer_id
        plan_id
        name
        email
        company
        communication_method
        language
        country
        phone
        message
        status
        notes
        customer_profile
        created_at
        updated_at
      }
    }
  `;

  const res = await hasuraRequest<{ leads: Lead[] }>(query);
  return res.leads || [];
});

export const updateAdminLeadStatus = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: string; notes?: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      mutation UpdateLeadStatus($id: uuid!, $status: String!, $notes: jsonb) {
        update_leads_by_pk(pk_columns: { id: $id }, _set: { status: $status, notes: $notes }) {
          id
        }
      }
    `;

    await hasuraRequest(query, ctx.data);
    return { success: true };
  });

export const deleteAdminLead = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    // Optionally restrict deletion to super_admin
    // if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation DeleteLead($id: uuid!) {
        delete_leads_by_pk(id: $id) {
          id
        }
      }
    `;

    await hasuraRequest(query, ctx.data);
    return { success: true };
  });

export const submitPublicContactLead = createServerFn({ method: "POST" })
  .validator((d: { name: string; email: string; subject: string; message: string }) => d)
  .handler(async (ctx) => {
    const { name, email, subject, message } = ctx.data;

    const mutation = `
      mutation SubmitPublicLead($name: String!, $email: String!, $notes: jsonb, $message: String) {
        insert_leads_one(object: {
          organizer_id: "00000000-0000-0000-0000-000000000000",
          name: $name,
          email: $email,
          notes: $notes,
          message: $message,
          status: "new"
        }) {
          id
        }
      }
    `;

    await hasuraRequest(mutation, {
      name,
      email,
      notes: `Subject: ${subject}`,
      message,
    });

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      try {
        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*New Contact Lead Received From Agatike!*\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n*Message:* ${message}`,
          }),
        });
      } catch (err) {
        console.error("Failed to send Slack notification:", err);
      }
    }

    return { success: true };
  });

export const getAdminLeadById = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetAdminLeadById($id: uuid!) {
        leads_by_pk(id: $id) {
          id
          organizer_id
          plan_id
          name
          email
          company
          communication_method
          language
          country
          phone
          message
          status
          notes
          customer_profile
          created_at
          updated_at
        }
      }
    `;

    const res = await hasuraRequest<{ leads_by_pk: Lead }>(query, ctx.data);
    return res.leads_by_pk;
  });

export const createAdminLead = createServerFn({ method: "POST" })
  .validator(
    (d: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      country?: string;
      notes?: string;
    }) => d,
  )
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { name, email, phone, company, country, notes } = ctx.data;

    const mutation = `
      mutation CreateAdminLead($name: String!, $email: String!, $phone: String, $company: String, $country: String, $notes: jsonb) {
        insert_leads_one(object: {
          organizer_id: "00000000-0000-0000-0000-000000000000",
          name: $name,
          email: $email,
          phone: $phone,
          company: $company,
          country: $country,
          notes: $notes,
          status: "new",
          customer_profile: {}
        }) {
          id
        }
      }
    `;

    const res = await hasuraRequest<{ insert_leads_one: { id: string } }>(mutation, {
      name,
      email,
      phone,
      company,
      country,
      notes,
    });

    return { success: true, id: res.insert_leads_one?.id };
  });

export const updateAdminLeadProfile = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      profile: any;
      name: string;
      email: string;
      phone?: string;
      company?: string;
      status: string;
    }) => d,
  )
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      mutation UpdateLeadProfile($id: uuid!, $profile: jsonb, $name: String!, $email: String!, $phone: String, $company: String, $status: String!) {
        update_leads_by_pk(pk_columns: { id: $id }, _set: { 
          customer_profile: $profile,
          name: $name,
          email: $email,
          phone: $phone,
          company: $company,
          status: $status
        }) {
          id
        }
      }
    `;

    await hasuraRequest(query, ctx.data);
    return { success: true };
  });

export const sendEmailToLead = createServerFn({ method: "POST" })
  .validator(
    (d: {
      leadId: string;
      subject: string;
      message: string;
      attachments?: any[];
      cc?: string;
      from_email?: string;
    }) => d,
  )
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { leadId, subject, message, attachments, cc, from_email } = ctx.data;

    // 1. Get the lead
    const getQuery = `
      query GetLead($id: uuid!) {
        leads_by_pk(id: $id) {
          id
          email
          customer_profile
        }
      }
    `;
    const leadRes = await hasuraRequest<{ leads_by_pk: any }>(getQuery, { id: leadId });
    const lead = leadRes.leads_by_pk;
    if (!lead) throw new Error("Lead not found");

    // 2. Send email via Resend
    const sender = from_email || "hello@agatike.rw";
    const senderName = sender === "sales@agatike.rw" ? "Agatike Sales" : "Agatike Connect";

    const resendPayload: any = {
      from: `${senderName} <${sender}>`,
      to: [lead.email],
      subject: subject,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${message}</div>`,
    };

    if (cc && cc.trim()) {
      resendPayload.cc = cc
        .split(",")
        .map((email: string) => email.trim())
        .filter(Boolean);
    }

    if (attachments && attachments.length > 0) {
      resendPayload.attachments = attachments.map((a: any) => ({
        filename: a.filename,
        content: a.content,
      }));
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
      },
      body: JSON.stringify(resendPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    // 3. Update customer_profile.communications
    const profile = lead.customer_profile || {};
    const communications = profile.communications || [];
    communications.push({
      id: Date.now().toString(),
      type: "sent",
      subject: subject,
      message: message,
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
    await hasuraRequest(updateQuery, { id: leadId, profile: { ...profile, communications } });

    return { success: true };
  });
