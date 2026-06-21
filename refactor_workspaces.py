import os
import glob

# 1. src/api/workspaces.ts
with open('src/api/workspaces.ts', 'r') as f:
    api_content = f.read()

old_get_ws = """export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  let orgnizer_id = session.sub;
  let allowedWorkspaces: string[] | null = null;
  let allowedModules: string[] | null = null;

  if (session.type === "workspace_user") {
    const meQuery = `
      query GetMe($id: uuid!) {
        workspace_users_by_pk(id: $id) {
          organizer_id
          workspaces
        }
      }
    `;
    const meData = await hasuraRequest<{ workspace_users_by_pk: any }>(meQuery, { id: session.sub });
    const me = meData.workspace_users_by_pk;
    
    if (!me) throw new Error("User not found");
    
    orgnizer_id = me.organizer_id;
    if (me.workspaces && !me.workspaces.includes("ALL")) {
      allowedWorkspaces = me.workspaces;
    }
  }

  const query = `
      query GetWorkspaces($orgnizer_id: uuid!) {
        workspaces(where: { orgnizer_id: { _eq: $orgnizer_id }, deleted: { _eq: false } }) {
          address
          city
          country
          created_at
          currency
          id
          logo
          moduls
          name
          orgnizer_id
          type
          updated_at
        }
      }
    `;

  const data = await hasuraRequest<{ workspaces: any[] }>(query, { orgnizer_id });
  
  let resultWorkspaces = data.workspaces;

  if (allowedWorkspaces) {
    resultWorkspaces = resultWorkspaces.filter((ws: any) => allowedWorkspaces!.includes(ws.id));
  }
  
  if (allowedModules) {
    resultWorkspaces = resultWorkspaces.map((ws: any) => {
      // workspace's own modules
      let wsModules: string[] = [];
      if (ws.moduls) {
        if (Array.isArray(ws.moduls)) {
          wsModules = ws.moduls;
        } else {
          wsModules = Object.keys(ws.moduls);
        }
      } else {
        wsModules = ["dashboard", "settings"];
      }
      
      // intersect with allowedModules
      const intersectedModules = wsModules.filter((m) => allowedModules!.includes(m));
      
      return {
        ...ws,
        moduls: intersectedModules,
      };
    });
  }

  return resultWorkspaces;
});"""

new_get_ws = """export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  let orgnizer_id = session.sub;
  let allowedWorkspaces: string[] | null = null;
  let allowedModules: string[] | null = null;
  let currentUser: any = null;

  if (session.type === "workspace_user") {
    const meQuery = `
      query GetMe($id: uuid!) {
        workspace_users_by_pk(id: $id) {
          organizer_id
          workspaces
          modules
          pages
          role
        }
      }
    `;
    const meData = await hasuraRequest<{ workspace_users_by_pk: any }>(meQuery, { id: session.sub });
    const me = meData.workspace_users_by_pk;
    
    if (!me) throw new Error("User not found");
    
    currentUser = {
      role: me.role,
      pages: me.pages || [],
      modules: me.modules || []
    };

    orgnizer_id = me.organizer_id;
    if (me.workspaces && !me.workspaces.includes("ALL")) {
      allowedWorkspaces = me.workspaces;
    }
    if (me.modules && !me.modules.includes("ALL")) {
      allowedModules = me.modules;
    }
  } else {
    currentUser = {
      role: "organizer",
      pages: ["ALL"],
      modules: ["ALL"]
    };
  }

  const query = `
      query GetWorkspaces($orgnizer_id: uuid!) {
        workspaces(where: { orgnizer_id: { _eq: $orgnizer_id }, deleted: { _eq: false } }) {
          address
          city
          country
          created_at
          currency
          id
          logo
          moduls
          name
          orgnizer_id
          type
          updated_at
        }
      }
    `;

  const data = await hasuraRequest<{ workspaces: any[] }>(query, { orgnizer_id });
  
  let resultWorkspaces = data.workspaces;

  if (allowedWorkspaces) {
    resultWorkspaces = resultWorkspaces.filter((ws: any) => allowedWorkspaces!.includes(ws.id));
  }
  
  if (allowedModules) {
    resultWorkspaces = resultWorkspaces.map((ws: any) => {
      let wsModules: string[] = [];
      if (ws.moduls) {
        if (Array.isArray(ws.moduls)) {
          wsModules = ws.moduls;
        } else {
          wsModules = Object.keys(ws.moduls);
        }
      } else {
        wsModules = ["dashboard", "settings"];
      }
      
      const intersectedModules = wsModules.filter((m) => allowedModules!.includes(m));
      
      return {
        ...ws,
        moduls: intersectedModules,
      };
    });
  }

  return { workspaces: resultWorkspaces, currentUser };
});"""

api_content = api_content.replace(old_get_ws, new_get_ws)
with open('src/api/workspaces.ts', 'w') as f:
    f.write(api_content)


# 2. src/contexts/WorkspaceContext.tsx
with open('src/contexts/WorkspaceContext.tsx', 'r') as f:
    ctx_content = f.read()

ctx_content = ctx_content.replace('workspaces: Workspace[];', 'workspaces: Workspace[];\n  currentUser: any;')

old_query = """    queryFn: async () => {
      const data = await getUserWorkspaces();
      return data.map((w: any) => ({"""

new_query = """    queryFn: async () => {
      const { workspaces: data, currentUser } = await getUserWorkspaces();
      const mappedWorkspaces = data.map((w: any) => ({"""

ctx_content = ctx_content.replace(old_query, new_query)

old_return = """        currency: w.currency || "RWF",
      })) as Workspace[];
    },"""

new_return = """        currency: w.currency || "RWF",
      })) as Workspace[];
      return { workspaces: mappedWorkspaces, currentUser };
    },"""

ctx_content = ctx_content.replace(old_return, new_return)

ctx_content = ctx_content.replace('const workspaces = workspacesData || [];', 'const workspaces = workspacesData?.workspaces || [];\n  const currentUser = workspacesData?.currentUser || null;')
ctx_content = ctx_content.replace('workspaces,\n        activeWorkspace: activeWorkspaceState,', 'workspaces,\n        currentUser,\n        activeWorkspace: activeWorkspaceState,')

with open('src/contexts/WorkspaceContext.tsx', 'w') as f:
    f.write(ctx_content)

print("Updated WorkspaceContext and workspaces API.")
