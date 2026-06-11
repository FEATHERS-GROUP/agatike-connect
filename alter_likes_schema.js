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
        sql: `
          ALTER TABLE event_post_likes DROP CONSTRAINT IF EXISTS event_post_likes_user_id_fkey;
          ALTER TABLE event_post_likes ALTER COLUMN user_id TYPE jsonb USING jsonb_build_array(user_id);
        `,
      },
    }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
