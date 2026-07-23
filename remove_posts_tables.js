import { config } from "dotenv";
config();

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query");
  const headers = {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  };

  // 1. Untrack tables in Hasura (order matters for untracking if there are relationships, though cascade might handle it, better to just untrack safely)
  console.log("Untracking tables...");
  const tables = ["event_post_likes", "event_post_comments", "event_posts"];

  for (const table of tables) {
    console.log(`Untracking ${table}...`);
    const untrackTableRes = await fetch(
      process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"),
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "pg_untrack_table",
          args: {
            source: "default",
            table: {
              schema: "public",
              name: table,
            },
            cascade: true,
          },
        }),
      },
    );
    const result = await untrackTableRes.json();
    console.log(`Untrack ${table} result:`, result);
  }

  // 2. Drop tables from database
  console.log("Dropping tables...");
  const dropTableRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: `
          DROP TABLE IF EXISTS event_post_likes CASCADE;
          DROP TABLE IF EXISTS event_post_comments CASCADE;
          DROP TABLE IF EXISTS event_posts CASCADE;
        `,
      },
    }),
  });
  console.log("Drop tables result:", await dropTableRes.json());

  // 3. Reload metadata
  console.log("Reloading Hasura metadata...");
  const metadataRes = await fetch(
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
  console.log("Metadata result:", await metadataRes.json());

  console.log("Database migration complete! Posts tables removed.");
}

run();
