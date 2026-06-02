import { getServerConfig } from "./src/lib/config.server";

async function runSql(sql: string) {
  const config = getServerConfig();
  const res = await fetch(`${config.hasuraAdminApi.replace("/v1/graphql", "/v2/query")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": config.hasuraAdminSecret!,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { source: "default", sql, read_only: false },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

async function run() {
  try {
    // Drop the bad gen_random_uuid() defaults from FK columns
    // user_id, attendee_id, and event_id should NOT auto-generate random UUIDs
    // since those random UUIDs won't exist in the referenced tables
    const result = await runSql(`
      ALTER TABLE event_feedback
        ALTER COLUMN user_id    SET DEFAULT NULL,
        ALTER COLUMN attendee_id SET DEFAULT NULL,
        ALTER COLUMN event_id   DROP DEFAULT;
    `);
    console.log("Fixed defaults:", JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
run();
