import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// --- QUERIES ---

const GET_WORKSPACE_APPS = `
  query GetWorkspaceApps($workspace_id: uuid!) {
    workspace_apps(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      name
      description
      theme_color
      logo_url
      is_active
      app_type
      created_at
      app_modules(order_by: { order: asc }) {
        id
        type
        title
        icon
        config
        order
      }
      app_permissions {
        id
        role
        workspace_user_id
      }
    }
  }
`;

export const getWorkspaceApps = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ workspace_apps: any[] }>(GET_WORKSPACE_APPS, { workspace_id });
  return data.workspace_apps || [];
});

const GET_APP_BY_ID = `
  query GetAppById($id: uuid!) {
    workspace_apps_by_pk(id: $id) {
      id
      workspace_id
      name
      description
      theme_color
      logo_url
      is_active
      app_type
      created_at
      app_modules(order_by: { order: asc }) {
        id
        type
        title
        icon
        config
        order
      }
      app_permissions {
        id
        role
        workspace_user_id
      }
    }
  }
`;

export const getAppById = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ workspace_apps_by_pk: any }>(GET_APP_BY_ID, { id });
  return data.workspace_apps_by_pk || null;
});

// --- MUTATIONS ---

const CREATE_WORKSPACE_APP = `
  mutation CreateWorkspaceApp($object: workspace_apps_insert_input!) {
    insert_workspace_apps_one(object: $object) {
      id
      name
    }
  }
`;

export const createWorkspaceApp = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const appData = ctx.data as any;
  return hasuraRequest(CREATE_WORKSPACE_APP, { object: appData });
});

const UPDATE_WORKSPACE_APP = `
  mutation UpdateWorkspaceApp($id: uuid!, $set: workspace_apps_set_input!) {
    update_workspace_apps_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
    }
  }
`;

export const updateWorkspaceApp = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, set } = ctx.data as any;
  return hasuraRequest(UPDATE_WORKSPACE_APP, { id, set });
});

const DELETE_WORKSPACE_APP = `
  mutation DeleteWorkspaceApp($id: uuid!) {
    delete_workspace_apps_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteWorkspaceApp = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  return hasuraRequest(DELETE_WORKSPACE_APP, { id });
});

// MODULES

const ADD_APP_MODULE = `
  mutation AddAppModule($object: app_modules_insert_input!) {
    insert_app_modules_one(object: $object) {
      id
      type
    }
  }
`;

export const addAppModule = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const moduleData = ctx.data as any;
  return hasuraRequest(ADD_APP_MODULE, { object: moduleData });
});

const UPDATE_APP_MODULE = `
  mutation UpdateAppModule($id: uuid!, $set: app_modules_set_input!) {
    update_app_modules_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

export const updateAppModule = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, set } = ctx.data as any;
  return hasuraRequest(UPDATE_APP_MODULE, { id, set });
});

const DELETE_APP_MODULE = `
  mutation DeleteAppModule($id: uuid!) {
    delete_app_modules_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteAppModule = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  return hasuraRequest(DELETE_APP_MODULE, { id });
});

const UPSERT_APP_MODULES = `
  mutation UpsertAppModules($objects: [app_modules_insert_input!]!) {
    insert_app_modules(
      objects: $objects,
      on_conflict: {
        constraint: app_modules_pkey,
        update_columns: [type, title, icon, config, order]
      }
    ) {
      affected_rows
    }
  }
`;

export const upsertAppModules = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { objects } = ctx.data as unknown as { objects: any[] };
  return hasuraRequest(UPSERT_APP_MODULES, { objects });
});

// PERMISSIONS

const ADD_APP_PERMISSION = `
  mutation AddAppPermission($object: app_permissions_insert_input!) {
    insert_app_permissions_one(object: $object) {
      id
      role
    }
  }
`;

export const addAppPermission = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const permissionData = ctx.data as any;
  return hasuraRequest(ADD_APP_PERMISSION, { object: permissionData });
});

const DELETE_APP_PERMISSION = `
  mutation DeleteAppPermission($id: uuid!) {
    delete_app_permissions_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteAppPermission = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  return hasuraRequest(DELETE_APP_PERMISSION, { id });
});
