import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_ALL_BADGE_PROJECTS = `
  query GetAllBadgeProjects {
    badge_projects(order_by: {created_at: desc}) {
      id
      logo_text
      theme
      gradient_class
      accent_color
      event_id
    }
  }
`;

export const getAllBadgeProjects = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const data = await hasuraRequest<{ badge_projects: any[] }>(GET_ALL_BADGE_PROJECTS, {});
    return data.badge_projects || [];
  });

const GET_BADGE_PROJECT_BY_ID = `
  query GetBadgeProjectById($id: uuid!) {
    badge_projects_by_pk(id: $id) {
      id
      accent_color
      back_design
      bg_image_url
      event_id
      font_family
      front_design
      gradient_class
      logo_text
      show_user_image
      sponsors_json
      theme
    }
  }
`;

export const getBadgeProjectById = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const { id } = ctx.data as unknown as { id: string };
    const data = await hasuraRequest<{ badge_projects_by_pk: any }>(GET_BADGE_PROJECT_BY_ID, { id });
    return data.badge_projects_by_pk || null;
  });

const INSERT_BADGE_PROJECT_MUTATION = `
  mutation InsertBadgeProject($id: uuid, $accent_color: String = "", $back_design: jsonb = "", $bg_image_url: String = "", $event_id: uuid = "", $font_family: String = "", $front_design: jsonb = "", $gradient_class: String = "", $logo_text: String = "", $sponsors_json: jsonb = "[]", $theme: String = "", $show_user_image: Boolean = false) {
    insert_badge_projects_one(object: {id: $id, accent_color: $accent_color, back_design: $back_design, bg_image_url: $bg_image_url, event_id: $event_id, font_family: $font_family, front_design: $front_design, gradient_class: $gradient_class, logo_text: $logo_text, show_user_image: $show_user_image, sponsors_json: $sponsors_json, theme: $theme}, on_conflict: {constraint: badge_projects_pkey, update_columns: [accent_color, back_design, bg_image_url, event_id, font_family, front_design, gradient_class, logo_text, show_user_image, sponsors_json, theme]}) {
      id
    }
  }
`;

export const saveBadgeProject = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    return await hasuraRequest(INSERT_BADGE_PROJECT_MUTATION, ctx.data);
  });
