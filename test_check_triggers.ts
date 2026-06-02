import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  // Use Hasura's run_sql to check triggers and column defaults on event_feedback
  const config = (await import("./src/lib/config.server")).getServerConfig();

  const res = await fetch(`${config.hasuraAdminApi.replace("/v1/graphql", "/v2/query")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": config.hasuraAdminSecret!,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          -- Check column defaults
          SELECT column_name, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'event_feedback'
          ORDER BY ordinal_position;
        `,
        read_only: true,
      },
    }),
  });
  const json = await res.json();
  console.log("Column info:", JSON.stringify(json?.result, null, 2));

  // Check triggers
  const triggerRes = await fetch(`${config.hasuraAdminApi.replace("/v1/graphql", "/v2/query")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": config.hasuraAdminSecret!,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          SELECT trigger_name, event_manipulation, action_statement
          FROM information_schema.triggers
          WHERE event_object_table = 'event_feedback';
        `,
        read_only: true,
      },
    }),
  });
  const triggerJson = await triggerRes.json();
  console.log("Triggers:", JSON.stringify(triggerJson?.result, null, 2));
}
run();
