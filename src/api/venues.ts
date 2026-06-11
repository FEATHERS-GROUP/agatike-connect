import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_VENUE_PROJECT = `
  mutation CreateVenueProject($object: venue_projects_insert_input!) {
    insert_venue_projects_one(object: $object) {
      id
    }
  }
`;

const UPDATE_VENUE_PROJECT = `
  mutation UpdateVenueProject($id: uuid!, $name: String, $event_id: uuid, $canvas_bg: String, $boundary_shape: String, $boundary_width: Int, $boundary_height: Int, $boundary_rx: Int, $sections_data: jsonb) {
    update_venue_projects_by_pk(
      pk_columns: { id: $id },
      _set: {
        name: $name,
        event_id: $event_id,
        canvas_bg: $canvas_bg,
        boundary_shape: $boundary_shape,
        boundary_width: $boundary_width,
        boundary_height: $boundary_height,
        boundary_rx: $boundary_rx,
        sections_data: $sections_data
      }
    ) {
      id
    }
  }
`;

const UPDATE_EVENT_SECTION_VENUE = `
  mutation UpdateEventSectionVenue($event_section_id: uuid!, $venue_project_id: uuid!) {
    update_event_sections_by_pk(
      pk_columns: { id: $event_section_id },
      _set: { venue_project_id: $venue_project_id }
    ) {
      id
    }
  }
`;

export const createVenueProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id, name, event_id, tour_stop_idx = 0, boundary } = ctx.data as any;
  const res = await hasuraRequest<{ insert_venue_projects_one: { id: string } }>(
    CREATE_VENUE_PROJECT,
    {
      object: {
        workspace_id,
        name,
        event_id,
        tour_stop_idx,
        boundary_shape: boundary?.shape || "rect",
        boundary_width: boundary?.width || 800,
        boundary_height: boundary?.height || 600,
        boundary_rx: boundary?.rx || 0,
      },
    },
  );
  return res.insert_venue_projects_one;
});

export const saveVenueProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const {
    venue_project_id,
    workspace_id,
    name,
    event_id,
    canvas_bg,
    boundary,
    sections,
    event_section_id,
  } = ctx.data as any;

  let projectId = venue_project_id;

  // 1. Create or Update the Venue Project
  if (!projectId) {
    const res = await hasuraRequest<{ insert_venue_projects_one: { id: string } }>(
      CREATE_VENUE_PROJECT,
      {
        object: {
          workspace_id,
          name,
          event_id,
          canvas_bg,
          sections_data: sections || [],
          boundary_shape: boundary?.shape,
          boundary_width: boundary?.width,
          boundary_height: boundary?.height,
          boundary_rx: boundary?.rx,
        },
      },
    );
    projectId = res.insert_venue_projects_one.id;
  } else {
    await hasuraRequest(UPDATE_VENUE_PROJECT, {
      id: projectId,
      name,
      event_id,
      canvas_bg,
      sections_data: sections || [],
      boundary_shape: boundary?.shape,
      boundary_width: boundary?.width,
      boundary_height: boundary?.height,
      boundary_rx: boundary?.rx,
    });
  }

  // 3. Link to Event Section if provided
  if (event_section_id) {
    await hasuraRequest(UPDATE_EVENT_SECTION_VENUE, {
      event_section_id,
      venue_project_id: projectId,
    });
  }

  return { success: true, venue_project_id: projectId };
});

const GET_WORKSPACE_VENUE_PROJECTS = `
  query GetWorkspaceVenueProjects($workspace_id: uuid!) {
    venue_projects(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      name
      event_id
      canvas_bg
      boundary_shape
      boundary_width
      boundary_height
      boundary_rx
      tour_stop_idx
      sections_data
    }
  }
`;

export const getWorkspaceVenueProjects = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ venue_projects: any[] }>(GET_WORKSPACE_VENUE_PROJECTS, {
    workspace_id,
  });
  return data.venue_projects || [];
});

const GET_PUBLIC_VENUES = `
  query GetPublicVenues {
    rentable_venues(order_by: { created_at: desc }) {
      id
      name
      type
      city
      cover_url
      currency
      pricing_tiers
    }
  }
`;

export const getPublicVenues = createServerFn({ method: "GET" }).handler(async () => {
  const data = await hasuraRequest<{ rentable_venues: any[] }>(GET_PUBLIC_VENUES, {});
  return data.rentable_venues || [];
});
