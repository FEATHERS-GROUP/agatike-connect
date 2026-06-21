const fs = require("fs");
let content = fs.readFileSync("src/api/workspaces.ts", "utf8");

// Find the start and end of getUserWorkspaces
const startIndex = content.indexOf(
  'export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {',
);
// Find the closing bracket of getUserWorkspaces handler
let endIndex = content.indexOf("});", startIndex) + 3;
// But wait, there might be other createServerFn... let's just use regex to replace it
const newFunction = `export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  let orgnizer_id = session.sub;
  let allowedWorkspaces = null;
  let allowedModules = null;
  let currentUser = null;

  if (session.type === "workspace_user") {
    const meQuery = \`
      query GetMe($id: uuid!) {
        workspace_users_by_pk(id: $id) {
          organizer_id
          workspaces
          modules
          pages
          role
        }
      }
    \`;
    const meData = await hasuraRequest(meQuery, { id: session.sub });
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

  const query = \`
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
    \`;

  const data = await hasuraRequest(query, { orgnizer_id });
  
  let resultWorkspaces = data.workspaces;

  if (allowedWorkspaces) {
    resultWorkspaces = resultWorkspaces.filter((ws) => allowedWorkspaces.includes(ws.id));
  }
  
  if (allowedModules) {
    const legacyIdMap = {
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

    const allowedLegacyIds = allowedModules.map(uuid => {
      const pMod = data.platformModules.find((p) => p.id === uuid);
      if (pMod && legacyIdMap[pMod.label]) {
        return legacyIdMap[pMod.label];
      }
      return uuid; 
    });

    allowedLegacyIds.push("dashboard", "settings");
    const allAllowedKeys = new Set([...allowedModules, ...allowedLegacyIds]);

    resultWorkspaces = resultWorkspaces.map((ws) => {
      let wsModules = [];
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
});`;

// Replace from export const getUserWorkspaces to the first });
content = content.replace(
  /export const getUserWorkspaces = createServerFn\(\{ method: "GET" \}\)\.handler\(async \(\) => \{[\s\S]*?\n\}\);/,
  newFunction,
);

fs.writeFileSync("src/api/workspaces.ts", content);
console.log("Fixed workspaces.ts");
