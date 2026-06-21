import { config } from "dotenv";
config();

async function run() {
  const payload = {
    type: "run_sql",
    args: {
      sql: `
        ALTER TABLE cinema_movies ADD COLUMN IF NOT EXISTS is_4dx BOOLEAN DEFAULT false;
        ALTER TABLE cinema_movies ADD COLUMN IF NOT EXISTS is_dolby BOOLEAN DEFAULT false;
        ALTER TABLE cinema_movies ADD COLUMN IF NOT EXISTS is_screenx BOOLEAN DEFAULT false;
        
        ALTER TABLE cinema_schedules ADD COLUMN IF NOT EXISTS is_4dx BOOLEAN DEFAULT false;
        ALTER TABLE cinema_schedules ADD COLUMN IF NOT EXISTS is_dolby BOOLEAN DEFAULT false;
        ALTER TABLE cinema_schedules ADD COLUMN IF NOT EXISTS is_screenx BOOLEAN DEFAULT false;
      `,
    },
  };

  const res = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(payload),
  });
  console.log(await res.json());

  // Also we need to track them in Hasura metadata if they are new,
  // but Hasura V2 query can run `track_table` or we just rely on auto-tracking or `track_column`.
  // Wait, ALTER TABLE might automatically expose them in Hasura if tracking is configured,
  // or we need to send track_table or reload metadata.

  const reload = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ type: "reload_metadata", args: { reload_remote_schemas: true } }),
  });
  console.log("Reload metadata:", await reload.json());
}
run();
