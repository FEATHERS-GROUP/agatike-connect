import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("2. Reloading metadata...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "reload_metadata",
      args: {
        reload_remote_schemas: true,
        reload_sources: true,
        recreate_event_triggers: true,
      },
    }),
  });
  console.log("Reload metadata result:", await trackRes.json());
}

run();
