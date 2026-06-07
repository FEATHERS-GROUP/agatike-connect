import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface UserLookupResponse {
  id: string;
  handle: string;
  username: string;
  email: string;
}

export const getUserByHandle = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const data = ctx.data as unknown as { handle: string };
  if (!data.handle) return null;

  const query = `
      query GetUserByHandle($handle: String!) {
        users(where: {handle: {_eq: $handle}}) {
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
  .validator((d: { ids: string[] }) => d)
  .handler(async (ctx) => {
  const data = ctx.data as { ids: string[] };
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

export const getOrganizerFollowersProfiles = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as { organizerId: string };
  if (!data.organizerId) return [];

  const followerQuery = `
    query GetFollowers($orgId: uuid!) {
      organizer_followers(where: {organizer_id: {_eq: $orgId}}) {
        user_id
      }
    }
  `;
  
  const fResult = await hasuraRequest<{ organizer_followers: { user_id: any }[] }>(followerQuery, { orgId: data.organizerId });
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
