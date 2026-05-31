import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_WORKSPACE_FORMS = `
  query GetWorkspaceForms($workspace_id: uuid!) {
    custom_forms(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      title
      description
      cover_image_url
      is_active
      created_at
      event_id
      rsvps {
        id
        status
      }
    }
  }
`;

export const getWorkspaceForms = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ custom_forms: any[] }>(GET_WORKSPACE_FORMS, { workspace_id });
  return data.custom_forms || [];
});

const GET_FORM_DETAILS = `
  query GetFormDetails($id: uuid!) {
    custom_forms_by_pk(id: $id) {
      id
      title
      description
      cover_image_url
      is_active
      created_at
      workspace_id
      event_id
      form_fields(order_by: { order: asc }) {
        id
        label
        field_type
        is_required
        options
        order
      }
      rsvps(order_by: { created_at: desc }) {
        id
        email
        first_name
        last_name
        status
        created_at
        rsvp_answers {
          id
          field_id
          answer_value
        }
      }
    }
  }
`;

export const getFormDetails = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ custom_forms_by_pk: any }>(GET_FORM_DETAILS, { id });
  return data.custom_forms_by_pk || null;
});

const CREATE_CUSTOM_FORM = `
  mutation CreateCustomForm($object: custom_forms_insert_input!) {
    insert_custom_forms_one(object: $object) {
      id
      title
    }
  }
`;

export const createCustomForm = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const object = ctx.data as any;
  const data = await hasuraRequest<{ insert_custom_forms_one: any }>(CREATE_CUSTOM_FORM, {
    object,
  });
  return data.insert_custom_forms_one;
});

const UPDATE_CUSTOM_FORM = `
  mutation UpdateCustomForm($id: uuid!, $title: String, $description: String, $cover_image_url: String, $is_active: Boolean) {
    update_custom_forms_by_pk(pk_columns: {id: $id}, _set: {title: $title, description: $description, cover_image_url: $cover_image_url, is_active: $is_active}) {
      id
    }
  }
`;

export const updateCustomForm = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const variables = ctx.data as any;
  const data = await hasuraRequest<{ update_custom_forms_by_pk: any }>(
    UPDATE_CUSTOM_FORM,
    variables,
  );
  return data.update_custom_forms_by_pk;
});

const CREATE_RSVP = `
  mutation CreateRSVP($object: rsvps_insert_input!) {
    insert_rsvps_one(object: $object) {
      id
    }
  }
`;

export const createRSVP = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const object = ctx.data as any;
  const data = await hasuraRequest<{ insert_rsvps_one: any }>(CREATE_RSVP, { object });
  return data.insert_rsvps_one;
});

const UPDATE_RSVP_STATUS = `
  mutation UpdateRsvpStatus($id: uuid!, $status: String!) {
    update_rsvps_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
    }
  }
`;

export const updateRsvpStatus = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, status } = ctx.data as unknown as { id: string; status: string };
  const data = await hasuraRequest<{ update_rsvps_by_pk: any }>(UPDATE_RSVP_STATUS, { id, status });
  return data.update_rsvps_by_pk;
});
