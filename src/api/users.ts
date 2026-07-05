import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface UserLookupResponse {
  id: string;
  handle: string;
  username: string;
  email: string;
}

export const getUserByHandle = createServerFn({ method: "GET" })
  .validator((d: { handle: string }) => d)
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
  .validator((d: { ids: string[] }) => d)
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
  .validator((d: { organizerId: string }) => d)
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
  .validator((d: { userId: string; token: string }) => d)
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

export const getAllUsers = createServerFn({ method: "GET" }).handler(async () => {
  const query = `
    query GetAllUsers {
      users(order_by: {created_at: desc}, limit: 500) {
        id
        username
        handle
        email
        country
        created_at
        profile
      }
    }
  `;

  try {
    const result = await hasuraRequest<{ users: any[] }>(query);
    return result.users || [];
  } catch (err) {
    console.error("Failed to fetch all users", err);
    return [];
  }
});

export const getUserDetailsForAdmin = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .handler(async (ctx) => {
    const { userId } = ctx.data;
    if (!userId) return null;

    const query = `
      query GetUserDetailsForAdmin($id: uuid!) {
        users_by_pk(id: $id) {
          id
          username
          handle
          email
          country
          created_at
          profile
          active
          banned
          agreed_to_terms
        }
        event_attendees(where: { user_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          names
          ticket_type
          status
          created_at
          events {
            title
            cover
          }
        }
        venue_bookings(where: { user_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          customer_name
          amount
          status
          start_time
          rentable_venue {
            name
            cover_url
          }
        }
        space_subscriptions(where: { user_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          plan_name
          price
          status
          billing_cycle
          start_date
          next_billing_date
          space {
            name
            cover_url
          }
        }
      }
    `;

    try {
      const result = await hasuraRequest<any>(query, { id: userId });
      return result;
    } catch (err) {
      console.error("Failed to fetch user details for admin", err);
      return null;
    }
  });

export const toggleUserActiveStatus = createServerFn({ method: "POST" })
  .validator((d: { userId: string; active: boolean }) => d)
  .handler(async (ctx) => {
    const { userId, active } = ctx.data;
    if (!userId) return { success: false };

    const mutation = `
      mutation ToggleUserActiveStatus($id: uuid!, $active: Boolean!) {
        update_users_by_pk(pk_columns: { id: $id }, _set: { active: $active }) {
          id
          active
        }
      }
    `;

    try {
      await hasuraRequest(mutation, { id: userId, active });
      return { success: true };
    } catch (err) {
      console.error("Failed to toggle user active status", err);
      return { success: false };
    }
  });
