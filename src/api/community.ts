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

import { deleteChannelMessages } from "@/lib/firebase";

export const getCommunityChannels = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;
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

    const result = await hasuraRequest<{ community_channels: CommunityChannel[] }>(query, {
      orgId: data.organizerId,
    });
    let channels = result.community_channels || [];

    const eventIds = [...new Set(channels.filter((c) => c.event_id).map((c) => c.event_id!))];

    if (eventIds.length > 0) {
      const eventsQuery = `
      query GetEventsForChannels($ids: [uuid!]!) {
        events(where: {id: {_in: $ids}}) {
          id
          tour_stops
          schedules {
            id
            start_date
            end_date
          }
        }
      }
    `;
      const eventsResult = await hasuraRequest<{ events: any[] }>(eventsQuery, { ids: eventIds });
      const events = eventsResult.events || [];

      const now = new Date();
      const validChannels: CommunityChannel[] = [];

      for (const channel of channels) {
        if (!channel.event_id) {
          validChannels.push(channel);
          continue;
        }

        const event = events.find((e) => e.id === channel.event_id);
        if (!event) {
          validChannels.push(channel);
          continue;
        }

        let endDate: Date | null = null;

        if (channel.schedule_id) {
          const schedule = event.schedules?.find((s: any) => s.id === channel.schedule_id);
          if (schedule) {
            endDate = new Date(schedule.end_date || schedule.start_date);
          }
        } else if (channel.tour_stop_idx !== null && channel.tour_stop_idx !== undefined) {
          const tourStop = event.tour_stops?.[channel.tour_stop_idx];
          if (tourStop) {
            endDate = new Date(tourStop.date);
          }
        } else {
          validChannels.push(channel);
          continue;
        }

        if (endDate) {
          const expirationDate = new Date(endDate);
          expirationDate.setDate(expirationDate.getDate() + 5);

          if (now > expirationDate) {
            // Expired, delete it asynchronously
            console.log(`Deleting expired channel ${channel.id}`);

            hasuraRequest(
              `
            mutation DeleteChannel($id: uuid!) {
              delete_community_channels_by_pk(id: $id) { id }
            }
          `,
              { id: channel.id },
            ).catch(console.error);

            deleteChannelMessages(channel.id).catch(console.error);

            continue; // skip pushing to validChannels
          }
        }

        validChannels.push(channel);
      }
      channels = validChannels;
    }

    return channels;
  });

export const getCommunityChannelsForOrganizers = createServerFn({ method: "POST" })
  .validator((d: { organizerIds: string[] }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;
    if (!data.organizerIds || data.organizerIds.length === 0) return [];

    const query = `
    query GetCommunityChannelsForOrganizers($orgIds: [uuid!]!) {
      community_channels(where: {organizer_id: {_in: $orgIds}}, order_by: {created_at: asc}) {
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

    const result = await hasuraRequest<{ community_channels: CommunityChannel[] }>(query, {
      orgIds: data.organizerIds,
    });
    return result.community_channels || [];
  });

export const createCommunityChannel = createServerFn({ method: "POST" })
  .validator(
    (d: {
      organizerId: string;
      name: string;
      coverUrl?: string;
      isMain?: boolean;
      eventId?: string;
      scheduleId?: string;
      tourStopIdx?: number;
    }) => d,
  )
  .handler(async (ctx) => {
    const data = ctx.data;

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

    const result = await hasuraRequest<{ insert_community_channels_one: CommunityChannel }>(
      mutation,
      {
        orgId: data.organizerId,
        name: data.name,
        cover: data.coverUrl || "",
        isMain: data.isMain || false,
        eventId: data.eventId || null,
        scheduleId: data.scheduleId || null,
        tourStopIdx: data.tourStopIdx !== undefined ? data.tourStopIdx : null,
      },
    );

    return result.insert_community_channels_one;
  });

export const updateCommunityChannel = createServerFn({ method: "POST" })
  .validator((d: { channelId: string; name?: string; coverUrl?: string }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;

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

    const result = await hasuraRequest<{ update_community_channels_by_pk: CommunityChannel }>(
      mutation,
      {
        id: data.channelId,
        name: data.name,
        coverUrl: data.coverUrl,
      },
    );

    return result.update_community_channels_by_pk;
  });
