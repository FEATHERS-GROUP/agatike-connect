import { hasuraRequest } from "./src/api/graphql.server.ts";

const query = `
  query GetOrganizerUsageStats($organizer_id: uuid!, $organizer_id_str: String!) {
    workspaces_aggregate(where: { orgnizer_id: { _eq: $organizer_id_str } }) { aggregate { count } }
    organizer_invoices_aggregate(where: { organizer_id: { _eq: $organizer_id_str } }) { aggregate { count } }
    workspace_users_aggregate(where: { organizer_id: { _eq: $organizer_id_str } }) { aggregate { count } }
  }
`;

async function run() {
  try {
    const res = await hasuraRequest(query, {
      organizer_id: "00000000-0000-0000-0000-000000000000",
      organizer_id_str: "00000000-0000-0000-0000-000000000000",
    });
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
