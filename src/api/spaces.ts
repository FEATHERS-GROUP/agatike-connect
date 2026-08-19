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
      workspace_id
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
      workspace {
        currency
      }
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

// --- ANALYTICS & CHECK-INS ---

const RECORD_CHECK_IN = `
  mutation RecordCheckIn($object: space_check_ins_insert_input!) {
    insert_space_check_ins_one(object: $object) {
      id
      check_in_time
    }
  }
`;

export const recordSpaceCheckIn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { space_id, user_id, space_subscription_id, method } = ctx.data;
    const res = await hasuraRequest<any>(RECORD_CHECK_IN, {
      object: {
        space_id,
        user_id,
        space_subscription_id,
        method: method || "qrcode_scan"
      }
    });
    return res.insert_space_check_ins_one;
  });

const GET_SPACE_ANALYTICS = `
  query GetSpaceAnalytics($space_id: uuid!, $startDate: timestamptz!) {
    space_check_ins(where: { space_id: { _eq: $space_id }, check_in_time: { _gte: $startDate } }) {
      check_in_time
    }
    invoices(where: { space_id: { _eq: $space_id }, created_at: { _gte: $startDate } }) {
      amount
      created_at
      status
    }
    space_subscriptions(where: { space_id: { _eq: $space_id }, created_at: { _gte: $startDate } }) {
      created_at
      status
    }
  }
`;

export const getSpaceAnalytics = createServerFn({ method: "POST" })
  .validator((d: { space_id: string; days?: number }) => d)
  .handler(async (ctx) => {
    const { space_id, days = 30 } = ctx.data;
    if (!space_id) throw new Error("space_id is required");
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const res = await hasuraRequest<any>(GET_SPACE_ANALYTICS, {
      space_id,
      startDate: startDate.toISOString()
    });
    return res;
  });

// --- STAFF MANAGERS ---

const GET_SPACE_MANAGERS = `
  query GetSpaceManagers($space_id: uuid!) {
    space_managers(where: { space_id: { _eq: $space_id } }, order_by: { created_at: desc }) {
      id
      workspace_user_id
      role
      created_at
      workspace_user {
        name
        email
      }
    }
  }
`;

export const getSpaceManagers = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    const res = await hasuraRequest<{ space_managers: any[] }>(GET_SPACE_MANAGERS, { space_id });
    return res.space_managers;
  });

const GET_SPACE_MANAGERS_BY_USER = `
  query GetSpaceManagersByUser($workspace_user_id: uuid!) {
    space_managers(where: { workspace_user_id: { _eq: $workspace_user_id } }) {
      id
      role
      space {
        id
        name
        type
        cover_url
      }
    }
  }
`;

export const getSpaceManagersByUser = createServerFn({ method: "POST" })
  .validator((d: { workspace_user_id: string }) => d)
  .handler(async (ctx) => {
    const { workspace_user_id } = ctx.data;
    const res = await hasuraRequest<{ space_managers: any[] }>(GET_SPACE_MANAGERS_BY_USER, { workspace_user_id });
    return res.space_managers;
  });

const ADD_SPACE_MANAGER = `
  mutation AddSpaceManager($object: space_managers_insert_input!) {
    insert_space_managers_one(object: $object) {
      id
    }
  }
`;

export const addSpaceManager = createServerFn({ method: "POST" })
  .validator((d: { space_id: string; workspace_user_id: string; role: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_space_managers_one: any }>(ADD_SPACE_MANAGER, {
      object: ctx.data,
    });
    return res.insert_space_managers_one;
  });

const REMOVE_SPACE_MANAGER = `
  mutation RemoveSpaceManager($id: uuid!) {
    delete_space_managers_by_pk(id: $id) {
      id
    }
  }
`;

export const removeSpaceManager = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_space_managers_by_pk: any }>(REMOVE_SPACE_MANAGER, {
      id: ctx.data.id,
    });
    return res.delete_space_managers_by_pk;
  });
