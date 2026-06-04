import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

export const getUserWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const query = `
      query GetWorkspaces($orgnizer_id: uuid!) {
        workspaces(where: { orgnizer_id: { _eq: $orgnizer_id }, deleted: { _eq: false } }) {
          address
          city
          country
          created_at
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

  const data = await hasuraRequest<{ workspaces: any[] }>(query, { orgnizer_id: session.sub });
  return data.workspaces;
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
      mutation UpdateWorkspace(
        $id: uuid!,
        $address: String, 
        $city: String, 
        $country: String, 
        $name: String, 
        $type: String, 
        $moduls: jsonb,
        $logo: String,
        $updated_at: String!
      ) {
        update_workspaces_by_pk(
          pk_columns: { id: $id },
          _set: {
            address: $address, 
            city: $city, 
            country: $country, 
            name: $name, 
            type: $type, 
            moduls: $moduls,
            logo: $logo,
            updated_at: $updated_at
          }
        ) {
          id
        }
      }
    `;

  const variables = {
    id,
    address: updateFields.address,
    city: updateFields.city,
    country: updateFields.country,
    name: updateFields.name,
    type: updateFields.type,
    moduls: updateFields.moduls,
    logo: updateFields.icon,
    updated_at: new Date().toISOString(),
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
