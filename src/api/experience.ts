import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";
import { deleteFiles } from "./storage";

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
  return data.insert_event_stories_one;
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

// ─── POSTS ────────────────────────────────────────────────────────────────────

export const createEventPost = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = ctx.data as unknown as {
    event_id: string;
    workspace_id: string;
    content: string;
    media_urls?: string[];
  };

  const mutation = `
    mutation CreateEventPost($object: event_posts_insert_input!) {
      insert_event_posts_one(object: $object) {
        id
        content
        created_at
      }
    }
  `;

  const data = await hasuraRequest<{ insert_event_posts_one: any }>(mutation, {
    object: {
      event_id: input.event_id,
      workspace_id: input.workspace_id,
      // user_id omitted — organizer session.sub is not in the users table
      content: input.content,
      media_urls: input.media_urls?.length ? JSON.stringify(input.media_urls) : "[]",
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      is_published: true,
    },
  });
  return data.insert_event_posts_one;
});

export const getEventPosts = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };

  const query = `
    query GetEventPosts($event_id: uuid!) {
      event_posts(
        where: { event_id: { _eq: $event_id }, is_published: { _eq: true } },
        order_by: [{ is_pinned: desc }, { created_at: desc }]
      ) {
        id
        content
        media_urls
        likes_count
        comments_count
        is_pinned
        is_published
        created_at
        user_id
        workspace_id
      }
    }
  `;

  const data = await hasuraRequest<{ event_posts: any[] }>(query, { event_id });
  return (data.event_posts || []).map((post) => {
    let parsedMediaUrls = [];
    try {
      if (typeof post.media_urls === "string") {
        parsedMediaUrls = JSON.parse(post.media_urls);
      } else if (Array.isArray(post.media_urls)) {
        parsedMediaUrls = post.media_urls;
      }
    } catch (e) {
      console.error("Failed to parse media_urls for post", post.id, e);
    }
    return {
      ...post,
      media_urls: parsedMediaUrls,
    };
  });
});

export const getGlobalFeedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const query = `
    query GetGlobalFeedPosts {
      event_posts(
        where: { is_published: { _eq: true } },
        order_by: { created_at: desc }
      ) {
        id
        content
        media_urls
        likes_count
        comments_count
        created_at
        event_id
        workspace {
          organizer {
            id
            handle
            name
            image
          }
        }
      }
    }
  `;

  const data = await hasuraRequest<{ event_posts: any[] }>(query, {});
  return (data.event_posts || []).map((post) => {
    let parsedMediaUrls = [];
    try {
      if (typeof post.media_urls === "string") {
        parsedMediaUrls = JSON.parse(post.media_urls);
      } else if (Array.isArray(post.media_urls)) {
        parsedMediaUrls = post.media_urls;
      }
    } catch (e) {
      console.error("Failed to parse media_urls for post", post.id, e);
    }

    const organizer = post.workspace?.organizer || {};

    return {
      id: post.id,
      user: organizer.name || "Organizer",
      handle: organizer.handle || "organizer",
      avatar: organizer.image,
      image: parsedMediaUrls[0] || null,
      caption: post.content,
      likes: post.likes_count,
      comments: post.comments_count,
      eventId: post.event_id,
      organizerId: organizer.id,
      created_at: post.created_at,
    };
  });
});

export const togglePinPost = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id, is_pinned } = ctx.data as unknown as { id: string; is_pinned: boolean };

  const mutation = `
    mutation TogglePinPost($id: uuid!, $is_pinned: Boolean!) {
      update_event_posts_by_pk(pk_columns: { id: $id }, _set: { is_pinned: $is_pinned }) {
        id
        is_pinned
      }
    }
  `;

  const data = await hasuraRequest<{ update_event_posts_by_pk: any }>(mutation, { id, is_pinned });
  return data.update_event_posts_by_pk;
});

export const deleteEventPost = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as unknown as { id: string };

  // First fetch the post to get the media URLs
  const getPostQuery = `
    query GetPostForDelete($id: uuid!) {
      event_posts_by_pk(id: $id) {
        media_urls
      }
    }
  `;
  const postData = await hasuraRequest<{ event_posts_by_pk: any }>(getPostQuery, { id });

  if (postData.event_posts_by_pk?.media_urls) {
    try {
      let urls: string[] = [];
      const rawUrls = postData.event_posts_by_pk.media_urls;
      if (typeof rawUrls === "string") {
        urls = JSON.parse(rawUrls);
      } else if (Array.isArray(rawUrls)) {
        urls = rawUrls;
      }

      if (urls.length > 0) {
        await deleteFiles({ data: { urls } } as any);
      }
    } catch (e) {
      console.error("Failed to delete post media from storage", e);
    }
  }

  const mutation = `
    mutation DeleteEventPost($id: uuid!) {
      delete_event_posts_by_pk(id: $id) { id }
    }
  `;

  const data = await hasuraRequest<{ delete_event_posts_by_pk: any }>(mutation, { id });
  return data.delete_event_posts_by_pk;
});

export const likeEventPost = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { post_id } = ctx.data as unknown as { post_id: string };

  const mutation = `
    mutation LikeEventPost($post_id: uuid!, $user_id: uuid!) {
      insert_event_post_likes_one(
        object: { post_id: $post_id, user_id: $user_id },
        on_conflict: { constraint: event_post_likes_post_id_user_id_key, update_columns: [] }
      ) {
        id
      }
      update_event_posts_by_pk(pk_columns: { id: $post_id }, _inc: { likes_count: 1 }) {
        id
        likes_count
      }
    }
  `;

  const data = await hasuraRequest<{ update_event_posts_by_pk: any }>(mutation, {
    post_id,
    user_id: session.sub,
  });
  return data.update_event_posts_by_pk;
});

export const addPostComment = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { post_id, content } = ctx.data as unknown as { post_id: string; content: string };

  const mutation = `
    mutation AddPostComment($post_id: uuid!, $user_id: uuid!, $content: String!) {
      insert_event_post_comments_one(object: { post_id: $post_id, user_id: $user_id, content: $content }) {
        id
        content
        created_at
      }
      update_event_posts_by_pk(pk_columns: { id: $post_id }, _inc: { comments_count: 1 }) {
        id
        comments_count
      }
    }
  `;

  const data = await hasuraRequest<{ insert_event_post_comments_one: any }>(mutation, {
    post_id,
    user_id: session.sub,
    content,
  });
  return data.insert_event_post_comments_one;
});

export const getPostComments = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { post_id } = ctx.data as unknown as { post_id: string };

  const query = `
    query GetPostComments($post_id: uuid!) {
      event_post_comments(
        where: { post_id: { _eq: $post_id } },
        order_by: { created_at: asc }
      ) {
        id
        content
        user_id
        created_at
      }
    }
  `;

  const data = await hasuraRequest<{ event_post_comments: any[] }>(query, { post_id });
  return data.event_post_comments || [];
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
