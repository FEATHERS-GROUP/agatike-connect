require("dotenv").config();
const { execSync } = require("child_process");

const adminApi = process.env.HASURA_ADMIN_API || "https://open-languages.hasura.app/v1/graphql";
const adminSecret = process.env.HASURA_ADMIN_SECRETE;

if (!adminSecret) {
  console.error("Missing HASURA_ADMIN_SECRETE in .env");
  process.exit(1);
}

// Map the graphql URL to the proper Hasura API endpoints
const v2QueryUrl = adminApi.replace("/v1/graphql", "/v2/query");
const metadataUrl = adminApi.replace("/v1/graphql", "/v1/metadata");

const sql = `
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE CASCADE,
  withdrawal_request_id UUID REFERENCES withdrawal_requests(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL,
  provider_cost NUMERIC NOT NULL DEFAULT 0,
  platform_revenue NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RWF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_earnings_wallet_tx ON earnings(wallet_transaction_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
`.replace(/\n/g, " ");

console.log("1. Creating earnings table in database...");
try {
  const createTableCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"run_sql","args":{"sql":"${sql}"}}' ${v2QueryUrl}`;
  const tableRes = JSON.parse(execSync(createTableCmd).toString());
  if (tableRes.error) console.log("   Info:", tableRes.error);
  else console.log("   ✅ Table created successfully");
} catch (e) {
  console.error("   ❌ Error creating table:", e.message);
}

console.log("\n2. Tracking table in Hasura GraphQL engine...");
try {
  const trackTableCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"pg_track_table","args":{"source":"default","schema":"public","name":"earnings"}}' ${metadataUrl}`;
  const trackRes = JSON.parse(execSync(trackTableCmd).toString());
  if (trackRes.error) console.log("   Info:", trackRes.error);
  else console.log("   ✅ Table tracked successfully");
} catch (e) {
  console.error("   ❌ Error tracking table:", e.message);
}

console.log("\n3. Creating GraphQL relationships...");
try {
  const trackRelsCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"bulk","args":[{"type":"pg_create_object_relationship","args":{"source":"default","table":"earnings","name":"wallet_transaction","using":{"foreign_key_constraint_on":"wallet_transaction_id"}}},{"type":"pg_create_object_relationship","args":{"source":"default","table":"earnings","name":"withdrawal_request","using":{"foreign_key_constraint_on":"withdrawal_request_id"}}}]}' ${metadataUrl}`;
  const relsRes = JSON.parse(execSync(trackRelsCmd).toString());
  if (relsRes.error) console.log("   Info:", relsRes.error);
  else console.log("   ✅ Relationships created successfully");
} catch (e) {
  console.error("   ❌ Error creating relationships:", e.message);
}

console.log("\n✅ Migration complete!");
