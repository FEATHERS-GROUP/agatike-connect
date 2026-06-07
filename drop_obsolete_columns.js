import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    ALTER TABLE public.rentable_venues
    DROP COLUMN IF EXISTS price_per_day,
    DROP COLUMN IF EXISTS price_per_hour,
    DROP COLUMN IF EXISTS price_per_week,
    DROP COLUMN IF EXISTS price_annually,
    DROP COLUMN IF EXISTS entrance_fee;
  `;

  console.log("Dropping obsolete columns...");
  const sqlRes = await fetch(HASURA_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { sql },
    }),
  });
  console.log(await sqlRes.json());

  console.log("Reloading metadata...");
  const reloadRes = await fetch(HASURA_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "reload_metadata",
      args: {},
    }),
  });
  console.log(await reloadRes.json());
}

run();
