import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface CommunityChannel {
  id: string;
  organizer_id: string;
  name: string;
  cover_url: string;
  is_main: boolean;
  event_id: string | null;
  schedule_id: string | null;
  tour_stop_idx: number | null;
  created_at: string;
}

export const getCommunityChannels = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as { organizerId: string };
  if (!data.organizerId) return [];

  const query = `
    query GetCommunityChannels($orgId: uuid!) {
      community_channels(where: {organizer_id: {_eq: $orgId}}, order_by: {created_at: asc}) {
        id
        organizer_id
        name
        cover_url
        is_main
        event_id
        schedule_id
        tour_stop_idx
        created_at
      }
    }
  `;

  const result = await hasuraRequest<{ community_channels: CommunityChannel[] }>(query, { orgId: data.organizerId });
  return result.community_channels || [];
});

export const createCommunityChannel = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as { 
    organizerId: string; 
    name: string; 
    coverUrl?: string; 
    isMain?: boolean; 
    eventId?: string;
    scheduleId?: string;
    tourStopIdx?: number;
  };
  
  if (!data.organizerId || !data.name) throw new Error("Missing required fields");

  const mutation = `
    mutation CreateCommunityChannel($orgId: uuid!, $name: String!, $cover: String, $isMain: Boolean, $eventId: uuid, $scheduleId: uuid, $tourStopIdx: Int) {
      insert_community_channels_one(object: {
        organizer_id: $orgId, 
        name: $name, 
        cover_url: $cover, 
        is_main: $isMain, 
        event_id: $eventId,
        schedule_id: $scheduleId,
        tour_stop_idx: $tourStopIdx
      }) {
        id
        organizer_id
        name
        cover_url
        is_main
        event_id
        schedule_id
        tour_stop_idx
        created_at
      }
    }
  `;

  const result = await hasuraRequest<{ insert_community_channels_one: CommunityChannel }>(mutation, {
    orgId: data.organizerId,
    name: data.name,
    cover: data.coverUrl || "",
    isMain: data.isMain || false,
    eventId: data.eventId || null,
    scheduleId: data.scheduleId || null,
    tourStopIdx: data.tourStopIdx !== undefined ? data.tourStopIdx : null
  });

  return result.insert_community_channels_one;
});

export const updateCommunityChannel = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as { 
    channelId: string; 
    name?: string; 
    coverUrl?: string; 
  };
  
  if (!data.channelId) throw new Error("Missing channel id");

  const mutation = `
    mutation UpdateCommunityChannel($id: uuid!, $name: String, $coverUrl: String) {
      update_community_channels_by_pk(
        pk_columns: {id: $id},
        _set: {
          name: $name,
          cover_url: $coverUrl
        }
      ) {
        id
        name
        cover_url
      }
    }
  `;

  const result = await hasuraRequest<{ update_community_channels_by_pk: CommunityChannel }>(mutation, {
    id: data.channelId,
    name: data.name,
    coverUrl: data.coverUrl
  });

  return result.update_community_channels_by_pk;
});
