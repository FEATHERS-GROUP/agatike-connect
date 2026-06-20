import { config } from "dotenv";
config();

async function run() {
  const sql = `
    ALTER TABLE cinemas ADD COLUMN IF NOT EXISTS latitude numeric;
    ALTER TABLE cinemas ADD COLUMN IF NOT EXISTS longitude numeric;
  `;
  const payload = {
    type: "run_sql",
    args: {
      sql,
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

  const result = await res.json();
  console.log("SQL Result:", result);

  // Also track the table if not already tracked or update schema cache
  const trackPayload = {
    type: "reload_metadata",
    args: {},
  };

  const trackRes = await fetch(
    process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
      },
      body: JSON.stringify(trackPayload),
    },
  );
  console.log("Metadata Reload:", await trackRes.json());
}
run();
