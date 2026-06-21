import sys

with open('src/api/workspaces.ts', 'r') as f:
    content = f.read()

old_query = """  const query = `
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

  const data = await hasuraRequest<{ workspaces: any[] }>(query, { orgnizer_id });"""

new_query = """  const query = `
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

  const data = await hasuraRequest<{ workspaces: any[], platformModules: {id: string, label: string}[] }>(query, { orgnizer_id });"""

content = content.replace(old_query, new_query)

old_intersect = """      const intersectedModules = wsModules.filter((m) => allowedModules!.includes(m));
      
      return {"""

new_intersect = """      // Map allowed UUIDs to legacy string IDs so they match wsModules
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
        return uuid; // fallback to uuid if no legacy map
      });

      // Always allow dashboard and settings
      allowedLegacyIds.push("dashboard", "settings");

      // Also support if allowedModules already contains the legacy string IDs
      const allAllowedKeys = new Set([...allowedModules!, ...allowedLegacyIds]);

      const intersectedModules = wsModules.filter((m) => allAllowedKeys.has(m));
      
      return {"""

content = content.replace(old_intersect, new_intersect)

with open('src/api/workspaces.ts', 'w') as f:
    f.write(content)

print("Updated workspaces.ts to correctly map UUIDs to module strings.")
