require("dotenv").config();
const { execSync } = require("child_process");

const adminApi = process.env.HASURA_ADMIN_API || "https://open-languages.hasura.app/v1/graphql";
const adminSecret = process.env.HASURA_ADMIN_SECRETE;

if (!adminSecret) {
  console.error("Missing HASURA_ADMIN_SECRETE in .env");
  process.exit(1);
}

const v2QueryUrl = adminApi.replace("/v1/graphql", "/v2/query");
const metadataUrl = adminApi.replace("/v1/graphql", "/v1/metadata");

const sql = `
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS customer_collection_fee_percentage NUMERIC DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS customer_collection_fee_fixed NUMERIC DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS organizer_collection_fee_percentage NUMERIC DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS organizer_collection_fee_fixed NUMERIC DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS withdrawal_fee_percentage NUMERIC DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS withdrawal_fee_fixed NUMERIC DEFAULT 0;

ALTER TABLE earnings ADD COLUMN IF NOT EXISTS customer_fee NUMERIC DEFAULT 0;
ALTER TABLE earnings ADD COLUMN IF NOT EXISTS organizer_fee NUMERIC DEFAULT 0;
`.replace(/\n/g, " ");

console.log("1. Modifying database schemas...");
try {
  const createTableCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"run_sql","args":{"sql":"${sql}"}}' ${v2QueryUrl}`;
  const tableRes = JSON.parse(execSync(createTableCmd).toString());
  if (tableRes.error) console.log("   Info:", tableRes.error);
  else console.log("   ✅ Columns added successfully");
} catch (e) {
  console.error("   ❌ Error modifying tables:", e.message);
}

console.log("\n2. Reloading Hasura metadata...");
try {
  const reloadCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"reload_metadata","args":{}}' ${metadataUrl}`;
  const trackRes = JSON.parse(execSync(reloadCmd).toString());
  if (trackRes.error) console.log("   Info:", trackRes.error);
  else console.log("   ✅ Metadata reloaded successfully");
} catch (e) {
  console.error("   ❌ Error reloading metadata:", e.message);
}

console.log("\n✅ Migration complete!");
