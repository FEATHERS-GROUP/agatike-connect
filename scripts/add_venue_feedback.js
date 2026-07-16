import { config } from "dotenv";
config();

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query");
  const headers = {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  };

  console.log("Adding new fields to `event_feedback` table...");
  const alterRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: `
          ALTER TABLE event_feedback ALTER COLUMN event_id DROP NOT NULL;
          ALTER TABLE event_feedback ADD COLUMN IF NOT EXISTS venue_id uuid;
          ALTER TABLE event_feedback ADD COLUMN IF NOT EXISTS space_id uuid;
        `,
      },
    }),
  });
  console.log("Alter event_feedback result:", await alterRes.json());

  console.log("Tracking new columns in Hasura metadata...");
  const metadataRes = await fetch(
    process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"),
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "pg_track_table",
        args: {
          source: "default",
          schema: "public",
          name: "event_feedback"
        }
      })
    }
  );
  // It might fail if already tracked, which is fine, we just need to reload metadata.

  console.log("Reloading Hasura metadata...");
  const reloadRes = await fetch(
    process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"),
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "reload_metadata",
        args: {
          reload_remote_schemas: true,
          reload_sources: true,
        },
      }),
    },
  );
  console.log("Metadata result:", await reloadRes.json());

  console.log("Database migration complete!");
}

run();
