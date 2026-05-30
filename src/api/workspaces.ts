import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

export const getUserWorkspaces = createServerFn({ method: "GET" })
  .handler(async () => {
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

export const createDatabaseWorkspace = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
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
      ...input,
      orgnizer_id: session.sub,
      updated_at: new Date().toISOString()
    };

    const data = await hasuraRequest<{ insert_workspaces: { returning: any[] } }>(mutation, variables);
    return data.insert_workspaces.returning[0];
  });
