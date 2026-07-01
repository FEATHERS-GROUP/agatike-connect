import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_SPACE = `
  mutation CreateSpace($object: spaces_insert_input!) {
    insert_spaces_one(object: $object) {
      id
    }
  }
`;

export const createSpace = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const {
      workspace_id,
      name,
      type,
      description,
      currency,
      cover_url,
      socials,
      locations,
      plans,
      status,
    } = ctx.data;

    const res = await hasuraRequest<{ insert_spaces_one: { id: string } }>(CREATE_SPACE, {
      object: {
        workspace_id,
        name,
        type,
        description,
        currency,
        cover_url,
        socials,
        locations,
        plans,
        status: status || "Active",
      },
    });
    return res.insert_spaces_one;
  });

const GET_SPACES = `
  query GetSpaces($workspace_id: uuid!) {
    spaces(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      name
      type
      description
      currency
      cover_url
      locations
      plans
      status
      rsvp_form_id
      page_id
      show_rsvp_form_button
      rsvp_form_button_text
      connected_forms
      created_at
    }
  }
`;

export const getSpaces = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    if (!workspace_id) throw new Error("workspace_id is required");
    const res = await hasuraRequest<{ spaces: any[] }>(GET_SPACES, {
      workspace_id,
    });
    return res.spaces;
  });

const GET_PUBLIC_SPACES = `
  query GetPublicSpaces {
    spaces(where: { status: { _in: ["Active", "Maintenance"] } }, order_by: { created_at: desc }) {
      id
      name
      type
      description
      currency
      cover_url
      locations
      plans
      status
      workspace {
        currency
      }
    }
  }
`;

export const getPublicSpaces = createServerFn({ method: "GET" }).handler(async () => {
  const res = await hasuraRequest<{ spaces: any[] }>(GET_PUBLIC_SPACES);
  return res.spaces;
});

const GET_SPACE_BY_ID = `
  query GetSpaceById($id: uuid!) {
    spaces_by_pk(id: $id) {
      id
      workspace_id
      name
      type
      description
      currency
      cover_url
      socials
      locations
      plans
      status
      rsvp_form_id
      page_id
      show_rsvp_form_button
      rsvp_form_button_text
      connected_forms
      created_at
    }
  }
`;

export const getSpaceById = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ spaces_by_pk: any }>(GET_SPACE_BY_ID, {
      id,
    });
    return res.spaces_by_pk;
  });

const UPDATE_SPACE = `
  mutation UpdateSpace($id: uuid!, $object: spaces_set_input!) {
    update_spaces_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

export const updateSpace = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id, ...updates } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ update_spaces_by_pk: { id: string } }>(UPDATE_SPACE, {
      id,
      object: updates,
    });
    return res.update_spaces_by_pk;
  });
