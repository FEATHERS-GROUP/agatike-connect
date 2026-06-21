import re

with open('src/api/workspaces.ts', 'r') as f:
    content = f.read()

new_function = """export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
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
        platformModules {
          id
          label
        }
      }
    `;

  const data = await hasuraRequest<{ workspaces: any[], platformModules: {id: string, label: string}[] }>(query, { orgnizer_id });
  
  let resultWorkspaces = data.workspaces;

  if (allowedWorkspaces) {
    resultWorkspaces = resultWorkspaces.filter((ws: any) => allowedWorkspaces!.includes(ws.id));
  }
  
  if (allowedModules) {
    const legacyIdMap: Record<string, string> = {
      Dashboard: "dashboard",
      Events: "events",
      Tickets: "tickets",
      RSVPs: "rsvps",
      Attendees: "rsvps",
      Scanning: "scanner",
      "Products & Add-ons": "products&add-ons",
      Merchandise: "merchandise",
      "VIP Access": "vip",
      Campaigns: "campaigns",
      "Venue Listings": "venue_listings",
      "Venue Designer": "venue_designer",
      Experiences: "experiences",
      Analytics: "analytics",
      Users: "users",
      Withdrawals: "withdrawals",
      Settings: "settings",
    };

    const allowedLegacyIds = allowedModules!.map(uuid => {
      const pMod = data.platformModules.find((p: any) => p.id === uuid);
      if (pMod && legacyIdMap[pMod.label]) {
        return legacyIdMap[pMod.label];
      }
      return uuid; 
    });

    allowedLegacyIds.push("dashboard", "settings");
    const allAllowedKeys = new Set([...allowedModules!, ...allowedLegacyIds]);

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
      
      const intersectedModules = wsModules.filter((m) => allAllowedKeys.has(m));
      
      return {
        ...ws,
        moduls: intersectedModules,
      };
    });
  }

  return { workspaces: resultWorkspaces, currentUser };
});"""

content = re.sub(r'export const getUserWorkspaces = createServerFn\(\{ method: "GET" \}\)\.handler\(async \(\) => \{.*?\n\}\);', new_function, content, flags=re.DOTALL)

with open('src/api/workspaces.ts', 'w') as f:
    f.write(content)

print("Fixed workspaces.ts")
