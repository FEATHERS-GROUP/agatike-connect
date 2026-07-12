import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";
import { getAdminSession } from "./admin_auth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type TicketCategory =
  | "billing"
  | "subscription"
  | "payment"
  | "event"
  | "model_issue"
  | "request"
  | "bug"
  | "other";

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "troubleshooting"
  | "pending_customer_response"
  | "on_hold"
  | "suspended"
  | "under_development";

export interface SupportTicket {
  id: string;
  organizer_id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  subscription_plan_name: string | null;
  created_at: string;
  updated_at: string;
  comments?: SupportTicketComment[];
  assignedAdmin?: { id: string; email: string } | null;
  organizer?: { id: string; name: string; email: string } | null;
}

export interface SupportTicketComment {
  id: string;
  ticket_id: string;
  author_type: "organizer" | "admin";
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// ORGANIZER SIDE
// ─────────────────────────────────────────────────────────────

export const createSupportTicket = createServerFn({ method: "POST" })
  .validator(
    (d: {
      subject: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
    }) => d,
  )
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const organizerId = session.sub;
    const { subject, description, category, priority } = ctx.data;

    // Fetch organizer's active subscription plan name
    let planName: string | null = null;
    try {
      const planRes = await hasuraRequest<{
        subscriptions: { pricing_plan: { name: string } | null }[];
      }>(
        `query GetPlan($id: uuid!) {
          subscriptions(where: { organizer_id: { _eq: $id }, status: { _eq: "active" } }, limit: 1) {
            pricing_plan { name }
          }
        }`,
        { id: organizerId },
      );
      planName = planRes.subscriptions[0]?.pricing_plan?.name || null;
    } catch (_) {}

    // Fetch organizer name for the comment
    let organizerName = "Organizer";
    try {
      const orgRes = await hasuraRequest<{ organizers_by_pk: { name: string } | null }>(
        `query GetOrg($id: uuid!) { organizers_by_pk(id: $id) { name } }`,
        { id: organizerId },
      );
      organizerName = orgRes.organizers_by_pk?.name || "Organizer";
    } catch (_) {}

    const mutation = `
      mutation CreateTicket($object: support_tickets_insert_input!) {
        insert_support_tickets_one(object: $object) {
          id
          subject
          status
          created_at
        }
      }
    `;

    const res = await hasuraRequest<{ insert_support_tickets_one: SupportTicket }>(mutation, {
      object: {
        organizer_id: organizerId,
        subject,
        description,
        category,
        priority,
        status: "open",
        subscription_plan_name: planName,
      },
    });

    const ticketId = res.insert_support_tickets_one.id;

    // Insert the initial message as a comment
    await hasuraRequest(
      `mutation AddComment($object: support_ticket_comments_insert_input!) {
        insert_support_ticket_comments_one(object: $object) { id }
      }`,
      {
        object: {
          ticket_id: ticketId,
          author_type: "organizer",
          author_id: organizerId,
          author_name: organizerName,
          body: description,
        },
      },
    );

    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      try {
        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*New Support Ticket Raised From Agatike!*\n*Ticket ID:* ${ticketId}\n*Organizer:* ${organizerName} (${organizerId})\n*Plan:* ${planName || "Free"}\n*Category:* ${category}\n*Priority:* ${priority}\n*Subject:* ${subject}\n*Description:* ${description}`,
          }),
        });
      } catch (err) {
        console.error("Failed to send Slack notification for support ticket:", err);
      }
    }

    return res.insert_support_tickets_one;
  });

export const getOrganizerTickets = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const query = `
    query GetOrgTickets($organizer_id: uuid!) {
      support_tickets(
        where: { organizer_id: { _eq: $organizer_id } }
        order_by: { updated_at: desc }
      ) {
        id
        subject
        category
        priority
        status
        subscription_plan_name
        assigned_to
        created_at
        updated_at
        comments(order_by: { created_at: desc }, limit: 1) {
          id
          body
          author_type
          author_name
          created_at
        }
      }
    }
  `;

  const res = await hasuraRequest<{ support_tickets: SupportTicket[] }>(query, {
    organizer_id: session.sub,
  });

  return res.support_tickets || [];
});

export const getOrganizerTicketWithComments = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const query = `
      query GetTicket($id: uuid!) {
        support_tickets_by_pk(id: $id) {
          id
          organizer_id
          subject
          description
          category
          priority
          status
          subscription_plan_name
          assigned_to
          created_at
          updated_at
          comments(order_by: { created_at: asc }) {
            id
            author_type
            author_id
            author_name
            body
            created_at
          }
        }
      }
    `;

    const res = await hasuraRequest<{ support_tickets_by_pk: SupportTicket }>(query, {
      id: ctx.data.ticketId,
    });

    const ticket = res.support_tickets_by_pk;
    if (!ticket || ticket.organizer_id !== session.sub) {
      throw new Error("Ticket not found");
    }

    return ticket;
  });

export const addOrganizerComment = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string; body: string }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { ticketId, body } = ctx.data;

    // Verify ownership
    const check = await hasuraRequest<{
      support_tickets_by_pk: {
        organizer_id: string;
        assigned_to: string | null;
        subject: string;
      } | null;
    }>(
      `query Check($id: uuid!) { support_tickets_by_pk(id: $id) { organizer_id assigned_to subject } }`,
      { id: ticketId },
    );
    if (check.support_tickets_by_pk?.organizer_id !== session.sub) {
      throw new Error("Unauthorized");
    }

    // Get organizer name
    let organizerName = "Organizer";
    try {
      const orgRes = await hasuraRequest<{ organizers_by_pk: { name: string } | null }>(
        `query GetOrg($id: uuid!) { organizers_by_pk(id: $id) { name } }`,
        { id: session.sub },
      );
      organizerName = orgRes.organizers_by_pk?.name || "Organizer";
    } catch (_) {}

    // Reopen ticket if resolved/closed when organizer replies
    await hasuraRequest(
      `mutation UpdateTicketStatus($id: uuid!, $now: timestamptz!) {
        update_support_tickets_by_pk(pk_columns: { id: $id }, _set: { status: "troubleshooting", updated_at: $now }) { id }
      }`,
      { id: ticketId, now: new Date().toISOString() },
    );

    const res = await hasuraRequest<{ insert_support_ticket_comments_one: SupportTicketComment }>(
      `mutation AddComment($object: support_ticket_comments_insert_input!) {
        insert_support_ticket_comments_one(object: $object) {
          id body author_type author_name created_at
        }
      }`,
      {
        object: {
          ticket_id: ticketId,
          author_type: "organizer",
          author_id: session.sub,
          author_name: organizerName,
          body,
        },
      },
    );

    if (check.support_tickets_by_pk?.assigned_to) {
      try {
        await addDoc(collection(db, "agatike_notifications"), {
          type: "comment",
          content: `Organizer replied to ticket: ${check.support_tickets_by_pk.subject || "Support Ticket"}`,
          adminId: check.support_tickets_by_pk.assigned_to,
          targetUsers: [check.support_tickets_by_pk.assigned_to],
          createdAt: new Date().toISOString(),
          actorId: session.sub,
        });
      } catch (e) {
        console.error("Failed to push org comment notification:", e);
      }
    }

    return res.insert_support_ticket_comments_one;
  });

// ─────────────────────────────────────────────────────────────
// ADMIN SIDE
// ─────────────────────────────────────────────────────────────

export const getAdminSupportTickets = createServerFn({ method: "POST" })
  .validator((d: { status?: string; unassigned?: boolean }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { status, unassigned } = ctx.data;

    let whereClause = "{}";
    if (status === "unassigned") {
      whereClause = `{ assigned_to: { _is_null: true }, status: { _neq: "closed" } }`;
    } else if (status === "in_progress") {
      whereClause = `{ assigned_to: { _is_null: false }, status: { _neq: "closed" } }`;
    } else if (status === "resolved" || status === "closed") {
      whereClause = `{ status: { _eq: "closed" } }`;
    }
    // 'all' => no filter

    const query = `
      query GetAdminTickets {
        support_tickets(
          order_by: { created_at: desc }
          ${status && status !== "all" ? `where: ${whereClause}` : ""}
        ) {
          id
          organizer_id
          subject
          category
          priority
          status
          assigned_to
          subscription_plan_name
          created_at
          updated_at
          comments_aggregate {
            aggregate { count }
          }
          comments(order_by: { created_at: desc }, limit: 1) {
            body
            author_type
            created_at
          }
        }
      }
    `;

    const res = await hasuraRequest<{ support_tickets: any[] }>(query);
    const tickets = res.support_tickets || [];

    // Enrich with organizer info
    if (tickets.length > 0) {
      const orgIds = [...new Set(tickets.map((t: any) => t.organizer_id))];
      const adminIds = [
        ...new Set(tickets.filter((t: any) => t.assigned_to).map((t: any) => t.assigned_to)),
      ];

      let orgMap: Record<string, any> = {};
      let adminMap: Record<string, any> = {};

      try {
        const orgRes = await hasuraRequest<{
          organizers: { id: string; name: string; email: string }[];
        }>(
          `query GetOrgs($ids: [uuid!]!) { organizers(where: { id: { _in: $ids } }) { id name email } }`,
          { ids: orgIds },
        );
        orgMap = Object.fromEntries((orgRes.organizers || []).map((o: any) => [o.id, o]));
      } catch (_) {}

      if (adminIds.length > 0) {
        try {
          const adminRes = await hasuraRequest<{ admin_users: { id: string; email: string }[] }>(
            `query GetAdmins($ids: [uuid!]!) { admin_users(where: { id: { _in: $ids } }) { id email } }`,
            { ids: adminIds },
          );
          adminMap = Object.fromEntries((adminRes.admin_users || []).map((a: any) => [a.id, a]));
        } catch (_) {}
      }

      return tickets.map((t: any) => ({
        ...t,
        organizer: orgMap[t.organizer_id] || null,
        assignedAdmin: t.assigned_to ? adminMap[t.assigned_to] || null : null,
        commentCount: t.comments_aggregate?.aggregate?.count || 0,
        lastComment: t.comments?.[0] || null,
      }));
    }

    return tickets;
  });

export const getAdminTicketWithComments = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetAdminTicket($id: uuid!) {
        support_tickets_by_pk(id: $id) {
          id
          organizer_id
          subject
          description
          category
          priority
          status
          assigned_to
          subscription_plan_name
          created_at
          updated_at
          comments(order_by: { created_at: asc }) {
            id
            author_type
            author_id
            author_name
            body
            created_at
          }
        }
      }
    `;

    const res = await hasuraRequest<{ support_tickets_by_pk: SupportTicket }>(query, {
      id: ctx.data.ticketId,
    });

    const ticket = res.support_tickets_by_pk;
    if (!ticket) throw new Error("Ticket not found");

    // Enrich organizer info
    try {
      const orgRes = await hasuraRequest<{
        organizers_by_pk: { id: string; name: string; email: string } | null;
      }>(`query GetOrg($id: uuid!) { organizers_by_pk(id: $id) { id name email } }`, {
        id: ticket.organizer_id,
      });
      (ticket as any).organizer = orgRes.organizers_by_pk;
    } catch (_) {}

    return ticket;
  });

export const assignTicket = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string; adminUserId: string | null }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { ticketId, adminUserId } = ctx.data;

    const res = await hasuraRequest<{ update_support_tickets_by_pk: { id: string } }>(
      `mutation AssignTicket($id: uuid!, $admin_id: uuid, $now: timestamptz!) {
        update_support_tickets_by_pk(
          pk_columns: { id: $id }
          _set: {
            assigned_to: $admin_id
            status: "in_progress"
            updated_at: $now
          }
        ) { id status }
      }`,
      {
        id: ticketId,
        admin_id: adminUserId,
        now: new Date().toISOString(),
      },
    );

    return res.update_support_tickets_by_pk;
  });

export const updateTicketStatus = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string; status: TicketStatus }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { ticketId, status } = ctx.data;

    const res = await hasuraRequest<{
      update_support_tickets_by_pk: { id: string; status: string };
    }>(
      `mutation UpdateStatus($id: uuid!, $status: String!, $now: timestamptz!) {
        update_support_tickets_by_pk(
          pk_columns: { id: $id }
          _set: { status: $status, updated_at: $now }
        ) { id status }
      }`,
      { id: ticketId, status, now: new Date().toISOString() },
    );

    return res.update_support_tickets_by_pk;
  });

export const updateTicketPriority = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string; priority: TicketPriority }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { ticketId, priority } = ctx.data;

    const res = await hasuraRequest<{
      update_support_tickets_by_pk: { id: string; priority: string };
    }>(
      `mutation UpdatePriority($id: uuid!, $priority: String!, $now: timestamptz!) {
        update_support_tickets_by_pk(
          pk_columns: { id: $id }
          _set: { priority: $priority, updated_at: $now }
        ) { id priority }
      }`,
      { id: ticketId, priority, now: new Date().toISOString() },
    );

    return res.update_support_tickets_by_pk;
  });

export const addAdminComment = createServerFn({ method: "POST" })
  .validator((d: { ticketId: string; body: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { ticketId, body } = ctx.data;

    const ticketCheck = await hasuraRequest<{
      support_tickets_by_pk: { organizer_id: string; subject: string } | null;
    }>(`query Check($id: uuid!) { support_tickets_by_pk(id: $id) { organizer_id subject } }`, {
      id: ticketId,
    });
    const orgId = ticketCheck.support_tickets_by_pk?.organizer_id;
    const subject = ticketCheck.support_tickets_by_pk?.subject || "Support Ticket";

    // Fetch admin email for display name
    let adminName = "Support Team";
    try {
      const adminRes = await hasuraRequest<{ admin_users_by_pk: { email: string } | null }>(
        `query GetAdmin($id: uuid!) { admin_users_by_pk(id: $id) { email } }`,
        { id: session.sub },
      );
      adminName = adminRes.admin_users_by_pk?.email?.split("@")[0] || "Support Team";
    } catch (_) {}

    // Update ticket status to pending_customer_response when admin replies
    await hasuraRequest(
      `mutation UpdateTicketStatus($id: uuid!, $now: timestamptz!) {
        update_support_tickets_by_pk(pk_columns: { id: $id }, _set: { status: "pending_customer_response", updated_at: $now }) { id }
      }`,
      { id: ticketId, now: new Date().toISOString() },
    );

    const res = await hasuraRequest<{ insert_support_ticket_comments_one: SupportTicketComment }>(
      `mutation AddAdminComment($object: support_ticket_comments_insert_input!) {
        insert_support_ticket_comments_one(object: $object) {
          id body author_type author_name created_at
        }
      }`,
      {
        object: {
          ticket_id: ticketId,
          author_type: "admin",
          author_id: session.sub,
          author_name: adminName,
          body,
        },
      },
    );

    if (orgId) {
      try {
        await addDoc(collection(db, "agatike_notifications"), {
          type: "comment",
          content: `Admin replied to your ticket: ${subject}`,
          organizerId: orgId,
          targetUsers: [orgId],
          createdAt: new Date().toISOString(),
          actorId: session.sub,
          link: "/dashboard/support",
        });
      } catch (e) {
        console.error("Failed to push admin comment notification:", e);
      }
    }

    return res.insert_support_ticket_comments_one;
  });

export const getAdminUsers = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");

  const res = await hasuraRequest<{ admin_users: { id: string; email: string; role: string }[] }>(
    `query GetAdminUsers {
      admin_users(order_by: { email: asc }) {
        id
        email
        role
      }
    }`,
  );

  return res.admin_users || [];
});

export const getAdminSupportStats = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");

  const query = `
    query GetSupportStats {
      total: support_tickets_aggregate { aggregate { count } }
      open: support_tickets_aggregate(where: { status: { _neq: "closed" } }) { aggregate { count } }
      unassigned: support_tickets_aggregate(where: { assigned_to: { _is_null: true }, status: { _neq: "closed" } }) { aggregate { count } }
      in_progress: support_tickets_aggregate(where: { assigned_to: { _is_null: false }, status: { _neq: "closed" } }) { aggregate { count } }
      closed: support_tickets_aggregate(where: { status: { _eq: "closed" } }) { aggregate { count } }
    }
  `;

  const res = await hasuraRequest<any>(query);

  return {
    total: res.total?.aggregate?.count || 0,
    open: res.open?.aggregate?.count || 0,
    unassigned: res.unassigned?.aggregate?.count || 0,
    in_progress: res.in_progress?.aggregate?.count || 0,
    closed: res.closed?.aggregate?.count || 0,
  };
});

export const bulkDeleteSupportTickets = createServerFn({ method: "POST" })
  .validator((d: { status: string; startDate: string; endDate: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { status, startDate, endDate } = ctx.data;

    let whereClause = `created_at: { _gte: "${startDate}", _lte: "${endDate}" }`;
    if (status && status !== "all") {
      whereClause += `, status: { _eq: "${status}" }`;
    }

    // Delete comments first to avoid foreign key constraints (if no cascade)
    try {
      await hasuraRequest(
        `mutation BulkDeleteComments {
          delete_support_ticket_comments(where: { ticket: { ${whereClause} } }) {
            affected_rows
          }
        }`,
      );
    } catch (e) {
      console.warn("Failed to delete comments (maybe already deleted or not configured)", e);
    }

    const res = await hasuraRequest<{ delete_support_tickets: { affected_rows: number } }>(
      `mutation BulkDeleteTickets {
        delete_support_tickets(where: { ${whereClause} }) {
          affected_rows
        }
      }`,
    );

    return res.delete_support_tickets?.affected_rows || 0;
  });
