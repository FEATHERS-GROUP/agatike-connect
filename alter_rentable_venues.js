import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    ALTER TABLE public.rentable_venues
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS images JSONB,
    ADD COLUMN IF NOT EXISTS opening_hours TEXT,
    ADD COLUMN IF NOT EXISTS closing_hours TEXT,
    ADD COLUMN IF NOT EXISTS instructions TEXT,
    ADD COLUMN IF NOT EXISTS amenities JSONB,
    ADD COLUMN IF NOT EXISTS sections JSONB;
  `;

  console.log("Altering table...");
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

  // Reload metadata to track the new columns
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
