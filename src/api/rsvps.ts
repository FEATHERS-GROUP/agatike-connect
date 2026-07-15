import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface FormField {
  id: string;
  label: string;
  field_type: "text" | "textarea" | "email" | "select" | "checkbox" | "radio" | "file" | "date";
  is_required: boolean;
  options: string[] | string;
  order: number;
}

export interface RsvpAnswer {
  id: string;
  field_id: string;
  answer_value: string;
}

export interface Rsvp {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  rsvp_answers?: RsvpAnswer[];
}

export interface CustomForm {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  is_active: boolean;
  created_at: string;
  event_id?: string | null;
  workspace?: { orgnizer_id: string };
  form_fields?: FormField[];
  rsvps?: { id: string; status: string }[] | Rsvp[];
}

const GET_WORKSPACE_FORMS = `
  query GetWorkspaceForms($workspace_id: uuid!) {
    custom_forms(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      title
      folder_id
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
      workspace {
        orgnizer_id
      }
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
  mutation UpdateCustomForm($id: uuid!, $changes: custom_forms_set_input!) {
    update_custom_forms_by_pk(pk_columns: {id: $id}, _set: $changes) {
      id
    }
  }
`;

export const updateCustomForm = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, ...changes } = ctx.data as any;
  const cleanedChanges: Record<string, any> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (value !== undefined) {
      cleanedChanges[key] = value;
    }
  }
  const data = await hasuraRequest<{ update_custom_forms_by_pk: any }>(UPDATE_CUSTOM_FORM, {
    id,
    changes: cleanedChanges,
  });
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

const DELETE_CUSTOM_FORM = `
  mutation DeleteCustomForm($id: uuid!) {
    delete_rsvp_answers(where: { rsvp: { form_id: { _eq: $id } } }) {
      affected_rows
    }
    delete_rsvps(where: { form_id: { _eq: $id } }) {
      affected_rows
    }
    delete_form_fields(where: { form_id: { _eq: $id } }) {
      affected_rows
    }
    delete_custom_forms_by_pk(id: $id) {
      id
    }
  }
`;

export const updateCustomFormFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = `
    mutation UpdateCustomFormFolder($id: uuid!, $folder_id: uuid) {
      update_custom_forms_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  `;
  return hasuraRequest(q, { id, folder_id });
});

export const deleteCustomForm = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ delete_custom_forms_by_pk: any }>(DELETE_CUSTOM_FORM, { id });
  return data.delete_custom_forms_by_pk;
});

export const updateCustomFormAndFields = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, title, description, cover_image_url, fields } = ctx.data as any;
  
  await hasuraRequest(`
    mutation UpdateCustomForm($id: uuid!, $title: String, $description: String, $cover: String) {
      update_custom_forms_by_pk(pk_columns: {id: $id}, _set: {
        title: $title, 
        description: $description, 
        cover_image_url: $cover
      }) { id }
    }
  `, { id, title, description, cover: cover_image_url });

  const existingIds = fields.filter((f: any) => !f.isNew).map((f: any) => f.id);
  
  if (existingIds.length > 0) {
    await hasuraRequest(`
      mutation DeleteRemovedFields($form_id: uuid!, $kept_ids: [uuid!]!) {
        delete_form_fields(where: {form_id: {_eq: $form_id}, id: {_nin: $kept_ids}}) {
          affected_rows
        }
      }
    `, { form_id: id, kept_ids: existingIds });
  } else {
    await hasuraRequest(`
      mutation DeleteAllFields($form_id: uuid!) {
        delete_form_fields(where: {form_id: {_eq: $form_id}}) {
          affected_rows
        }
      }
    `, { form_id: id });
  }

  if (fields.length > 0) {
    const objects = fields.map((f: any) => ({
      id: f.isNew ? undefined : f.id,
      form_id: id,
      label: f.label,
      field_type: f.field_type,
      is_required: f.is_required,
      order: f.order,
      options: f.options
    }));
    
    await hasuraRequest(`
      mutation UpsertFields($objects: [form_fields_insert_input!]!) {
        insert_form_fields(
          objects: $objects,
          on_conflict: {
            constraint: form_fields_pkey,
            update_columns: [label, field_type, is_required, options, order]
          }
        ) {
          affected_rows
        }
      }
    `, { objects });
  }
  
  return { success: true };
});
