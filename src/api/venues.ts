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
  mutation UpdateVenueProject($id: uuid!, $name: String, $canvas_bg: String, $boundary_shape: String, $boundary_width: Int, $boundary_height: Int, $boundary_rx: Int) {
    update_venue_projects_by_pk(
      pk_columns: { id: $id },
      _set: {
        name: $name,
        canvas_bg: $canvas_bg,
        boundary_shape: $boundary_shape,
        boundary_width: $boundary_width,
        boundary_height: $boundary_height,
        boundary_rx: $boundary_rx
      }
    ) {
      id
    }
  }
`;

const DELETE_VENUE_PROJECT_SECTIONS = `
  mutation DeleteVenueProjectSections($venue_project_id: uuid!) {
    delete_venue_project_sections(where: { venue_project_id: { _eq: $venue_project_id } }) {
      affected_rows
    }
  }
`;

const INSERT_VENUE_PROJECT_SECTIONS = `
  mutation InsertVenueProjectSections($objects: [venue_project_sections_insert_input!]!) {
    insert_venue_project_sections(objects: $objects) {
      affected_rows
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

export const saveVenueProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { venue_project_id, workspace_id, name, canvas_bg, boundary, sections, event_section_id } = ctx.data as any;

  let projectId = venue_project_id;

  // 1. Create or Update the Venue Project
  if (!projectId) {
    const res = await hasuraRequest<{ insert_venue_projects_one: { id: string } }>(CREATE_VENUE_PROJECT, {
      object: {
        workspace_id,
        name,
        canvas_bg,
        boundary_shape: boundary?.shape,
        boundary_width: boundary?.width,
        boundary_height: boundary?.height,
        boundary_rx: boundary?.rx,
      }
    });
    projectId = res.insert_venue_projects_one.id;
  } else {
    await hasuraRequest(UPDATE_VENUE_PROJECT, {
      id: projectId,
      name,
      canvas_bg,
      boundary_shape: boundary?.shape,
      boundary_width: boundary?.width,
      boundary_height: boundary?.height,
      boundary_rx: boundary?.rx,
    });
    // Delete existing sections to fully replace them
    await hasuraRequest(DELETE_VENUE_PROJECT_SECTIONS, { venue_project_id: projectId });
  }

  // 2. Insert the shapes
  if (sections && sections.length > 0) {
    const sectionObjects = sections.map((s: any) => ({
      venue_project_id: projectId,
      name: s.name,
      type: s.type,
      shape: s.shape,
      color: s.color,
      geometry: {
        x: s.x,
        y: s.y,
        rotation: s.rotation,
        scaleX: s.scaleX,
        scaleY: s.scaleY,
        width: s.width,
        height: s.height,
        innerRadius: s.innerRadius,
        outerRadius: s.outerRadius,
        startAngle: s.startAngle,
        endAngle: s.endAngle,
        points: s.points,
        pathData: s.pathData,
        pitchType: s.pitchType
      },
      capacity_config: {
        rows: s.rows,
        cols: s.cols,
        capacity: s.capacity
      }
    }));
    await hasuraRequest(INSERT_VENUE_PROJECT_SECTIONS, { objects: sectionObjects });
  }

  // 3. Link to Event Section if provided
  if (event_section_id) {
    await hasuraRequest(UPDATE_EVENT_SECTION_VENUE, {
      event_section_id,
      venue_project_id: projectId
    });
  }

  return { success: true, venue_project_id: projectId };
});

const GET_WORKSPACE_VENUE_PROJECTS = `
  query GetWorkspaceVenueProjects($workspace_id: uuid!) {
    venue_projects(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      name
      canvas_bg
      boundary_shape
      boundary_width
      boundary_height
      boundary_rx
      venue_project_sections {
        id
        name
        type
        shape
        color
        geometry
        capacity_config
      }
    }
  }
`;

export const getWorkspaceVenueProjects = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ venue_projects: any[] }>(GET_WORKSPACE_VENUE_PROJECTS, { workspace_id });
  return data.venue_projects || [];
});
