import "dotenv/config";

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query");
  const secret = process.env.HASURA_ADMIN_SECRETE;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": secret,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: "ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS scanned boolean DEFAULT false; ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS scanned_at timestamp with time zone;",
      },
    }),
  });

  const json = await res.json();
  console.log("SQL Result:", json);

  const res2 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": secret,
    },
    body: JSON.stringify({
      type: "pg_reload_metadata",
      args: {
        reload_remote_schemas: true,
      },
    }),
  });
  console.log("Reload Metadata Result:", await res2.json());
}

run().catch(console.error);
