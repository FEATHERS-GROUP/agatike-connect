import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession, getUserSession } from "./auth";
import { deleteFiles } from "./storage";

import { sendPushNotification } from "./push";

// ─── STORIES ──────────────────────────────────────────────────────────────────

export const createEventStory = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = ctx.data as unknown as {
    event_id: string;
    workspace_id?: string;
    media_url: string;
    media_type: "photo" | "video";
    caption?: string;
  };

  // Stories expire after 24 hours
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const mutation = `
    mutation CreateEventStory($object: event_stories_insert_input!) {
      insert_event_stories_one(object: $object) {
        id
        media_url
        media_type
        created_at
      }
    }
  `;

  const data = await hasuraRequest<{ insert_event_stories_one: any }>(mutation, {
    object: {
      event_id: input.event_id,
      workspace_id: input.workspace_id || null,
      // user_id omitted — organizer session.sub is not in the users table
      // the column is nullable so NULL is inserted safely
      media_url: input.media_url,
      media_type: input.media_type,
      caption: input.caption || null,
      expires_at,
      views_count: "0",
    },
  });
  const result = data.insert_event_stories_one;

  if (result?.id && input.workspace_id) {
    try {
      // 1. Get organizer_id from workspace
      const wsQuery = `
        query GetWorkspaceOrg($id: uuid!) {
          workspaces_by_pk(id: $id) {
            orgnizer_id
          }
        }
      `;
      const wsData = await hasuraRequest<{ workspaces_by_pk: any }>(wsQuery, {
        id: input.workspace_id,
      });
      const orgId = wsData?.workspaces_by_pk?.orgnizer_id;

      if (orgId) {
        // 2. Get followers
        const followersQuery = `
          query GetFollowers($orgId: uuid!) {
            organizer_followers(where: { organizer_id: { _eq: $orgId } }) {
              user_id
            }
          }
        `;
        const followersData = await hasuraRequest<{ organizer_followers: any[] }>(followersQuery, {
          orgId,
        });
        const row = followersData?.organizer_followers?.[0];

        if (row && row.user_id) {
          const userIds = Array.isArray(row.user_id) ? row.user_id : [row.user_id];
          const targetUsers = userIds.map((u: any) => String(u).replace(/"/g, ""));

          if (targetUsers.length > 0) {
            const { getFirebaseAdmin } = await import("@/lib/firebase.server");
            const { db } = getFirebaseAdmin();
            await db.collection("agatike_notifications").add({
              type: "new_story",
              storyId: result.id,
              eventId: input.event_id,
              organizerId: input.workspace_id,
              actorId: session.sub,
              targetUsers: targetUsers,
              createdAt: new Date().toISOString(),
            });

            await sendPushNotification({
              data: {
                userIds: targetUsers,
                title: "New Story",
                body: "An organizer you follow just posted a new story.",
                data: { url: `/event/${input.event_id}` },
              },
            } as any);
          }
        }
      }
    } catch (e) {
      console.error("Failed to push new_story notification:", e);
    }
  }

  return result;
});

export const getEventStories = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };

  const now = new Date().toISOString();

  // Lazily clean up expired stories to ensure they are physically deleted from Supabase
  const cleanupMutation = `
    mutation CleanupStories($now: timestamptz!) {
      delete_event_stories(where: { expires_at: { _lte: $now } }) {
        returning {
          media_url
        }
      }
    }
  `;
  hasuraRequest<{ delete_event_stories: any }>(cleanupMutation, { now })
    .then(async (res) => {
      const deletedUrls = res.delete_event_stories?.returning
        ?.map((r: any) => r.media_url)
        .filter(Boolean);
      if (deletedUrls && deletedUrls.length > 0) {
        await deleteFiles({ data: { urls: deletedUrls } } as any);
      }
    })
    .catch(console.error);
  const query = `
    query GetEventStories($event_id: uuid!, $now: timestamptz!) {
      event_stories(
        where: { event_id: { _eq: $event_id }, expires_at: { _gt: $now } },
        order_by: { created_at: desc }
      ) {
        id
        media_url
        media_type
        caption
        views_count
        expires_at
        created_at
        user_id
      }
    }
  `;

  const data = await hasuraRequest<{ event_stories: any[] }>(query, { event_id, now });
  return data.event_stories || [];
});

export const incrementStoryView = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };

  const mutation = `
    mutation IncrementStoryView($id: uuid!) {
      update_event_stories_by_pk(
        pk_columns: { id: $id },
        _inc: { views_count: 1 }
      ) {
        id
        views_count
      }
    }
  `;

  const data = await hasuraRequest<{ update_event_stories_by_pk: any }>(mutation, { id });
  return data.update_event_stories_by_pk;
});

export const deleteEventStory = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as unknown as { id: string };

  const getStoryQuery = `
    query GetStoryForDelete($id: uuid!) {
      event_stories_by_pk(id: $id) {
        media_url
      }
    }
  `;
  const storyData = await hasuraRequest<{ event_stories_by_pk: any }>(getStoryQuery, { id });

  if (storyData.event_stories_by_pk?.media_url) {
    try {
      await deleteFiles({ data: { urls: [storyData.event_stories_by_pk.media_url] } } as any);
    } catch (e) {
      console.error("Failed to delete story media from storage", e);
    }
  }

  const mutation = `
    mutation DeleteEventStory($id: uuid!) {
      delete_event_stories_by_pk(id: $id) { id }
    }
  `;

  const data = await hasuraRequest<{ delete_event_stories_by_pk: any }>(mutation, { id });
  return data.delete_event_stories_by_pk;
});

// ─── HIGHLIGHTS ───────────────────────────────────────────────────────────────

export const getEventHighlights = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };

  const query = `
    query GetEventHighlights($event_id: uuid!) {
      event_highlights(
        where: { event_id: { _eq: $event_id } },
        order_by: { display_order: asc }
      ) {
        id
        type
        title
        content
        media_url
        display_order
        created_at
      }
    }
  `;

  const data = await hasuraRequest<{ event_highlights: any[] }>(query, { event_id });
  return data.event_highlights || [];
});

export const upsertEventHighlight = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = ctx.data as unknown as {
    id?: string;
    event_id: string;
    workspace_id: string;
    type: string;
    title?: string;
    content?: string;
    media_url?: string;
    display_order?: number;
  };

  if (input.id) {
    const mutation = `
      mutation UpdateHighlight($id: uuid!, $title: String, $content: String, $media_url: String, $display_order: Int) {
        update_event_highlights_by_pk(
          pk_columns: { id: $id },
          _set: { title: $title, content: $content, media_url: $media_url, display_order: $display_order }
        ) { id }
      }
    `;
    const data = await hasuraRequest<{ update_event_highlights_by_pk: any }>(mutation, input);
    return data.update_event_highlights_by_pk;
  } else {
    const mutation = `
      mutation InsertHighlight($object: event_highlights_insert_input!) {
        insert_event_highlights_one(object: $object) { id }
      }
    `;
    const data = await hasuraRequest<{ insert_event_highlights_one: any }>(mutation, {
      object: {
        event_id: input.event_id,
        workspace_id: input.workspace_id,
        type: input.type,
        title: input.title || null,
        content: input.content || null,
        media_url: input.media_url || null,
        display_order: input.display_order ?? 0,
      },
    });
    return data.insert_event_highlights_one;
  }
});

export const deleteEventHighlight = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as unknown as { id: string };

  const mutation = `
    mutation DeleteHighlight($id: uuid!) {
      delete_event_highlights_by_pk(id: $id) { id }
    }
  `;

  const data = await hasuraRequest<{ delete_event_highlights_by_pk: any }>(mutation, { id });
  return data.delete_event_highlights_by_pk;
});

export const getCommunityMoments = createServerFn({ method: "GET" })
  .validator((d: any) => d)
  .handler(async () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const query = `
    query GetCommunityMoments($twoWeeksAgo: timestamptz!) {
      event_stories(
        where: { created_at: { _gte: $twoWeeksAgo } }
        order_by: { created_at: desc }
      ) {
        id
        media_url
        caption
        created_at
        workspaces {
          name
          organizer {
            handle
            name
          }
        }
      }
      event_highlights(
        where: { created_at: { _gte: $twoWeeksAgo } }
        order_by: { created_at: desc }
      ) {
        id
        media_url
        title
        content
        created_at
        workspace {
          name
          organizer {
            handle
            name
          }
        }
      }
    }
  `;

    const res = await hasuraRequest<{ event_stories: any[]; event_highlights: any[] }>(query, {
      twoWeeksAgo,
    });

    const stories = (res.event_stories || []).map((s) => ({
      id: s.id,
      image: s.media_url,
      handle:
        s.workspaces?.organizer?.handle ||
        s.workspaces?.name?.toLowerCase().replace(/\s+/g, "") ||
        "organizer",
      caption: s.caption || s.workspaces?.name || "Moment",
      created_at: s.created_at,
    }));

    const highlights = (res.event_highlights || [])
      .filter((h) => h.media_url) // only highlights with images
      .map((h) => ({
        id: h.id,
        image: h.media_url,
        handle:
          h.workspace?.organizer?.handle ||
          h.workspace?.name?.toLowerCase().replace(/\s+/g, "") ||
          "organizer",
        caption: h.title || h.content || h.workspace?.name || "Highlight",
        created_at: h.created_at,
      }));

    // Combine and sort by created_at desc
    const combined = [...stories, ...highlights].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return combined;
  });
