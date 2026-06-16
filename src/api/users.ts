import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface UserLookupResponse {
  id: string;
  handle: string;
  username: string;
  email: string;
}

export const getUserByHandle = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;
    if (!data.handle) return null;

    const query = `
      query GetUserByHandle($handle: String!) {
        users(where: {_or: [
          {handle: {_eq: $handle}},
          {username: {_eq: $handle}},
          {email: {_eq: $handle}}
        ]}) {
          id
          handle
          username
          email
        }
      }
    `;

    const result = await hasuraRequest<{ users: UserLookupResponse[] }>(query, {
      handle: data.handle,
    });
    return result.users[0] || null;
  });

export const getUsersByIds = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: string[] }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;
    if (!data.ids || data.ids.length === 0) return [];

    const query = `
      query GetUsersByIds($ids: [uuid!]!) {
        users(where: {id: {_in: $ids}}) {
          id
          username
          handle
          country
          profile
        }
      }
    `;

    const result = await hasuraRequest<{ users: any[] }>(query, {
      ids: data.ids,
    });
    return result.users || [];
  });

export const getOrganizerFollowersProfiles = createServerFn({ method: "POST" })
  .inputValidator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;
    if (!data.organizerId) return [];

    const followerQuery = `
    query GetFollowers($orgId: uuid!) {
      organizer_followers(where: {organizer_id: {_eq: $orgId}}) {
        user_id
      }
    }
  `;

    const fResult = await hasuraRequest<{ organizer_followers: { user_id: any }[] }>(
      followerQuery,
      { orgId: data.organizerId },
    );
    const row = fResult.organizer_followers[0];
    if (!row || !row.user_id) return [];

    let ids: string[] = [];
    try {
      // user_id is a JSONB array like ["uuid1", "uuid2"]
      ids = typeof row.user_id === "string" ? JSON.parse(row.user_id) : row.user_id;
    } catch (e) {
      return [];
    }

    if (!Array.isArray(ids) || ids.length === 0) return [];

    const usersQuery = `
    query GetUsersByIds($ids: [uuid!]!) {
      users(where: {id: {_in: $ids}}) {
        id
        username
        handle
        country
        profile
      }
    }
  `;

    const uResult = await hasuraRequest<{ users: any[] }>(usersQuery, { ids });
    return uResult.users || [];
  });

export const saveFCMToken = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; token: string }) => d)
  .handler(async (ctx) => {
    const { userId, token } = ctx.data as any;
    if (!userId || !token) return { success: false };

    // Fetch user to update profile
    const query = `
      query GetUserProfile($id: uuid!) {
        users_by_pk(id: $id) {
          profile
        }
      }
    `;
    const getResult = await hasuraRequest<{ users_by_pk: any }>(query, { id: userId });
    let profile = getResult?.users_by_pk?.profile || {};

    if (typeof profile === "string") {
      try {
        profile = JSON.parse(profile);
      } catch (e) {
        profile = {};
      }
    }

    // Initialize fcm_tokens array if not present
    const tokens = new Set(profile.fcm_tokens || []);
    tokens.add(token);
    profile.fcm_tokens = Array.from(tokens);

    const updateQuery = `
      mutation UpdateUserFCMToken($id: uuid!, $profile: jsonb!) {
        update_users_by_pk(pk_columns: {id: $id}, _set: {profile: $profile}) {
          id
        }
      }
    `;

    try {
      await hasuraRequest(updateQuery, { id: userId, profile });
      return { success: true };
    } catch (err) {
      console.error("Failed to save FCM token", err);
      return { success: false };
    }
  });
