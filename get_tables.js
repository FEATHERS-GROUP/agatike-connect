import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const tables = [
    "users",
    "organizers",
    "organizer_users",
    "workspaces",
    "workspace_users",
    "workspace_members",
  ];
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('${tables.join("','")}');`,
      },
    }),
  });
  console.log(await res.json());
}
run();
