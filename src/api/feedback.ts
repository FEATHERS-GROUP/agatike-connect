import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

// ─── Submit Feedback (public — no auth required) ──────────────────────────────
export const submitEventFeedback = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const input = ctx.data as unknown as {
    event_id: string;
    attendee_id?: string;
    reviewer_name: string;
    reviewer_email: string;
    rating: number;
    title?: string;
    body?: string;
    category_scores?: Record<string, number>;
    tags?: string[];
    media_urls?: string[];
    source?: string;
  };

  // Verify attendee belongs to this event if attendee_id is provided
  let is_verified = false;
  if (input.attendee_id) {
    const checkQuery = `
      query CheckAttendee($id: uuid!, $event_id: uuid!) {
        event_attendees_by_pk(id: $id) {
          id
          event_id
          email
        }
      }
    `;
    const checkData = await hasuraRequest<{ event_attendees_by_pk: any }>(checkQuery, {
      id: input.attendee_id,
    });
    const att = checkData.event_attendees_by_pk;
    if (att && att.event_id === input.event_id) {
      is_verified = true;
    }
  }

  const mutation = `
    mutation SubmitEventFeedback($object: event_feedback_insert_input!) {
      insert_event_feedback_one(object: $object) {
        id
        rating
        is_verified
      }
    }
  `;

  const data = await hasuraRequest<{ insert_event_feedback_one: any }>(mutation, {
    object: {
      event_id: input.event_id,
      attendee_id: input.attendee_id || null,
      reviewer_name: input.reviewer_name,
      reviewer_email: input.reviewer_email,
      rating: input.rating,
      title: input.title || null,
      body: input.body || null,
      category_scores: input.category_scores || null,
      tags: input.tags || [],
      media_urls: input.media_urls || [],
      source: input.source || "web",
      is_verified,
      is_featured: false,
      is_public: true,
    },
  });
  return data.insert_event_feedback_one;
});

// ─── Get Event Feedback (dashboard — auth required) ───────────────────────────
export const getEventFeedback = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { event_id } = ctx.data as unknown as { event_id: string };

  const query = `
    query GetEventFeedback($event_id: uuid!) {
      event_feedback(
        where: { event_id: { _eq: $event_id } },
        order_by: [{ is_featured: desc }, { created_at: desc }]
      ) {
        id
        reviewer_name
        reviewer_email
        rating
        title
        body
        category_scores
        tags
        media_urls
        is_verified
        is_featured
        is_public
        source
        created_at
      }
      event_feedback_aggregate(where: { event_id: { _eq: $event_id } }) {
        aggregate {
          count
          avg { rating }
        }
      }
    }
  `;

  const data = await hasuraRequest<{
    event_feedback: any[];
    event_feedback_aggregate: any;
  }>(query, { event_id });

  return {
    reviews: data.event_feedback || [],
    aggregate: data.event_feedback_aggregate?.aggregate || { count: 0, avg: { rating: 0 } },
  };
});

// ─── Get Public Feedback Summary ──────────────────────────────────────────────
export const getEventFeedbackPublic = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };

  const query = `
    query GetPublicFeedback($event_id: uuid!) {
      event_feedback(
        where: { event_id: { _eq: $event_id }, is_public: { _eq: true } },
        order_by: [{ is_featured: desc }, { created_at: desc }],
        limit: 20
      ) {
        id
        reviewer_name
        rating
        title
        body
        tags
        is_verified
        is_featured
        created_at
      }
      event_feedback_aggregate(where: { event_id: { _eq: $event_id }, is_public: { _eq: true } }) {
        aggregate {
          count
          avg { rating }
        }
      }
    }
  `;

  const data = await hasuraRequest<{
    event_feedback: any[];
    event_feedback_aggregate: any;
  }>(query, { event_id });

  return {
    reviews: data.event_feedback || [],
    aggregate: data.event_feedback_aggregate?.aggregate || { count: 0, avg: { rating: 0 } },
  };
});

// ─── Update Feedback (organizer actions: feature, hide) ───────────────────────
export const updateFeedback = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id, is_featured, is_public } = ctx.data as unknown as {
    id: string;
    is_featured?: boolean;
    is_public?: boolean;
  };

  const mutation = `
    mutation UpdateFeedback($id: uuid!, $is_featured: Boolean, $is_public: Boolean) {
      update_event_feedback_by_pk(
        pk_columns: { id: $id },
        _set: { is_featured: $is_featured, is_public: $is_public }
      ) {
        id
        is_featured
        is_public
      }
    }
  `;

  const data = await hasuraRequest<{ update_event_feedback_by_pk: any }>(mutation, {
    id,
    is_featured,
    is_public,
  });
  return data.update_event_feedback_by_pk;
});

// ─── Check if user already submitted feedback ─────────────────────────────────
export const checkFeedbackExists = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id, reviewer_email } = ctx.data as unknown as {
    event_id: string;
    reviewer_email: string;
  };

  const query = `
    query CheckFeedback($event_id: uuid!, $reviewer_email: String!) {
      event_feedback(where: {
        event_id: { _eq: $event_id },
        reviewer_email: { _eq: $reviewer_email }
      }, limit: 1) {
        id
      }
    }
  `;

  const data = await hasuraRequest<{ event_feedback: any[] }>(query, {
    event_id,
    reviewer_email,
  });
  return data.event_feedback.length > 0;
});
