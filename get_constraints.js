import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const res = await fetch(HASURA_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: "SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'event_post_likes'::regclass;",
      },
    }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
