import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
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
    const meData = await hasuraRequest<{ workspace_users_by_pk: any }>(meQuery, {
      id: session.sub,
    });
    const me = meData.workspace_users_by_pk;

    if (!me) throw new Error("User not found");

    currentUser = {
      id: orgnizer_id,
      role: me.role,
      pages: me.pages || [],
      modules: me.modules || [],
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
      id: orgnizer_id,
      role: "organizer",
      pages: ["ALL"],
      modules: ["ALL"],
    };
  }

  // --- Subscription & Trial Logic (Runs for both Organizer & Workspace User) ---
  try {
    const subQuery = `
      query GetActiveSub {
        subscriptions(
          where: { organizer_id: { _eq: "${orgnizer_id}" }, status: { _eq: "active" } }
          order_by: { created_at: desc }
          limit: 1
        ) {
          created_at
          amount
          next_billing_date
          pricing_plan {
            name
          }
        }
      }
    `;
    const subRes = await hasuraRequest<{ subscriptions: any[] }>(subQuery);
    const activeSub = subRes.subscriptions?.[0];

    if (activeSub) {
      currentUser.planName = activeSub.pricing_plan?.name;
      currentUser.isBasic = activeSub.amount === 0;
      currentUser.nextBillingDate = activeSub.next_billing_date;

      if (currentUser.isBasic) {
        const subDate = new Date(activeSub.created_at);
        const now = new Date();
        const diffDays = (now.getTime() - subDate.getTime()) / (1000 * 3600 * 24);

        if (diffDays <= 14) {
          currentUser.isTrialActive = true;
          currentUser.trialDaysLeft = Math.max(1, Math.ceil(14 - diffDays));
        } else {
          currentUser.isTrialExpired = true;
        }
      } else if (activeSub.next_billing_date) {
        const billingDate = new Date(activeSub.next_billing_date);
        const now = new Date();
        const diffDays = (billingDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 3 && diffDays >= 0) {
          currentUser.isExpiringSoon = true;
          currentUser.daysUntilExpiration = Math.max(0, Math.ceil(diffDays));
        } else if (diffDays < 0) {
          currentUser.isExpired = true;
        }
      }
    } else {
      currentUser.isBasic = true;
    }
  } catch (err) {
    console.warn("Failed to check subscription:", err);
  }
  // -------------------------------

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
        organizers_by_pk(id: $orgnizer_id) {
          active
          business
        }
      }
    `;

  const data = await hasuraRequest<{
    workspaces: any[];
    platformModules: { id: string; label: string }[];
    organizers_by_pk?: { active: boolean; business: boolean };
  }>(query, { orgnizer_id });

  currentUser.isActive = data.organizers_by_pk?.active ?? true;
  currentUser.business = data.organizers_by_pk?.business ?? false;

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
      "Page Builder": "page_builder",
      "Badge Designer": "badge_designer",
      "Ticket Designer": "ticket_designer",
    };

    const allowedLegacyIds = allowedModules!.map((uuid) => {
      const pMod = data.platformModules.find((p: any) => p.id === uuid);
      if (pMod && legacyIdMap[pMod.label]) {
        return legacyIdMap[pMod.label];
      }
      return uuid;
    });

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
});

export const createDatabaseWorkspace = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = ctx.data as any;

  const mutation = `
      mutation CreateWorkspace(
        $address: String = "", 
        $city: String = "", 
        $country: String = "", 
        $currency: String = "",
        $logo: String = "", 
        $moduls: jsonb = "", 
        $name: String = "", 
        $orgnizer_id: uuid = "", 
        $type: String = "", 
        $updated_at: String = ""
      ) {
        insert_workspaces(objects: {
          address: $address, 
          city: $city, 
          country: $country, 
          currency: $currency,
          logo: $logo, 
          moduls: $moduls, 
          name: $name, 
          orgnizer_id: $orgnizer_id, 
          type: $type, 
          updated_at: $updated_at, 
          deleted: false
        }) {
          returning {
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
      }
    `;

  const variables = {
    address: input.address || "",
    city: input.city || "",
    country: input.country || "",
    currency: input.currency || "RWF",
    logo: input.logo || "",
    moduls: input.moduls || "",
    name: input.name || "",
    type: input.type || "",
    orgnizer_id: session.sub,
    updated_at: new Date().toISOString(),
  };

  const data = await hasuraRequest<{ insert_workspaces: { returning: any[] } }>(
    mutation,
    variables,
  );
  const workspace = data.insert_workspaces.returning[0];

  if (workspace && workspace.id) {
    // Create Wallet
    const walletNumber = Math.random().toString(36).substring(2, 11).toUpperCase().padEnd(9, "0");
    const walletMutation = `
        mutation CreateWallet($amount: numeric = "0", $currency: String = "", $updated_at: timestamptz = "", $walletNumber: String = "", $workspace_id: uuid = "") {
          insert_wallets(objects: {amount: $amount, currency: $currency, deleted: false, updated_at: $updated_at, walletNumber: $walletNumber, workspace_id: $workspace_id}) {
            affected_rows
          }
        }
      `;
    try {
      await hasuraRequest(walletMutation, {
        amount: 0,
        currency: input.currency || "dollars",
        updated_at: new Date().toISOString(),
        walletNumber,
        workspace_id: workspace.id,
      });
    } catch (err) {
      console.error("Failed to create wallet for workspace", err);
    }

    // Sync all workspaces to the organizer's active subscription workspace_id JSON array
    try {
      const syncQuery = `
        query GetOrgWsAndSub($orgId: uuid!) {
          workspaces(where: { orgnizer_id: { _eq: $orgId }, deleted: { _eq: false } }) {
            id
          }
          subscriptions(where: { organizer_id: { _eq: $orgId }, status: { _eq: "active" } }, limit: 1) {
            id
          }
        }
      `;
      const syncData = await hasuraRequest<{ workspaces: any[]; subscriptions: any[] }>(syncQuery, {
        orgId: session.sub,
      });

      if (syncData.subscriptions.length > 0) {
        const subId = syncData.subscriptions[0].id;
        const workspaceIds = syncData.workspaces.map((w) => w.id);

        const updateSubQuery = `
          mutation UpdateSubWorkspaces($subId: uuid!, $workspaceIds: jsonb!) {
            update_subscriptions_by_pk(pk_columns: { id: $subId }, _set: { workspace_id: $workspaceIds }) {
              id
            }
          }
        `;
        await hasuraRequest(updateSubQuery, { subId, workspaceIds });
      }
    } catch (err) {
      console.error("Failed to sync workspace IDs to subscription", err);
    }
  }

  return workspace;
});

export const updateDatabaseWorkspace = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const input = ctx.data as any;
  const { id, ...updateFields } = input;

  if (!id) throw new Error("Workspace ID is required");

  const mutation = `
      mutation UpdateWorkspace($id: uuid!, $_set: workspaces_set_input!) {
        update_workspaces_by_pk(pk_columns: { id: $id }, _set: $_set) {
          id
        }
      }
    `;

  const _set: any = {};
  if (updateFields.address !== undefined) _set.address = updateFields.address;
  if (updateFields.city !== undefined) _set.city = updateFields.city;
  if (updateFields.country !== undefined) _set.country = updateFields.country;
  if (updateFields.currency !== undefined) {
    _set.currency = updateFields.currency;

    // Update Wallet Currency to match workspace
    const updateWalletMutation = `
      mutation UpdateWalletCurrency($workspace_id: uuid!, $currency: String!, $updated_at: timestamptz!) {
        update_wallets(where: { workspace_id: { _eq: $workspace_id } }, _set: { currency: $currency, updated_at: $updated_at }) {
          affected_rows
        }
      }
    `;
    try {
      hasuraRequest(updateWalletMutation, {
        workspace_id: id,
        currency: updateFields.currency,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to update wallet currency", err);
    }
  }
  if (updateFields.name !== undefined) _set.name = updateFields.name;
  if (updateFields.type !== undefined) _set.type = updateFields.type;
  if (updateFields.moduls !== undefined) _set.moduls = updateFields.moduls;
  if (updateFields.logo !== undefined) _set.logo = updateFields.logo;
  else if (updateFields.icon !== undefined) _set.logo = updateFields.icon; // fallback for potential typo
  _set.updated_at = new Date().toISOString();

  const variables = {
    id,
    _set,
  };

  const data = await hasuraRequest<{ update_workspaces_by_pk: { id: string } }>(
    mutation,
    variables,
  );
  return data.update_workspaces_by_pk;
});

export const disableDatabaseWorkspace = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as any;
  if (!id) throw new Error("Workspace ID is required");

  const mutation = `
      mutation DisableWorkspace($id: uuid!, $updated_at: String!) {
        update_workspaces_by_pk(
          pk_columns: { id: $id },
          _set: {
            deleted: true,
            updated_at: $updated_at
          }
        ) {
          id
        }
      }
    `;

  const data = await hasuraRequest<{ update_workspaces_by_pk: { id: string } }>(mutation, {
    id,
    updated_at: new Date().toISOString(),
  });
  return data.update_workspaces_by_pk;
});

export const getPublicWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
  const query = `
    query GetPublicWorkspaces {
      workspaces(where: { deleted: { _eq: false } }, order_by: { created_at: desc }) {
        id
        name
        city
        country
        logo
        type
        address
        organizer {
          name
        }
      }
    }
  `;
  const data = await hasuraRequest<{ workspaces: any[] }>(query);
  return data.workspaces || [];
});
