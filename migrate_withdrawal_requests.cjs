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
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  amount NUMERIC NOT NULL,
  net_amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'RWF',
  payout_method TEXT NOT NULL DEFAULT 'momo',
  payout_account TEXT NOT NULL,
  network_id TEXT,
  country_code TEXT DEFAULT 'RWA',
  target_currency TEXT,
  exchange_rate NUMERIC DEFAULT 1,
  platform_fee NUMERIC DEFAULT 0,
  network_fee NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  admin_user_id UUID REFERENCES admin_users(id),
  wallet_transaction_id UUID REFERENCES wallet_transactions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_workspace ON withdrawal_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created ON withdrawal_requests(created_at DESC);
`.replace(/\n/g, " ");

console.log("1. Creating withdrawal_requests table in database...");
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
  const trackTableCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"pg_track_table","args":{"source":"default","schema":"public","name":"withdrawal_requests"}}' ${metadataUrl}`;
  const trackRes = JSON.parse(execSync(trackTableCmd).toString());
  if (trackRes.error) console.log("   Info:", trackRes.error);
  else console.log("   ✅ Table tracked successfully");
} catch (e) {
  console.error("   ❌ Error tracking table:", e.message);
}

console.log("\n3. Creating GraphQL relationships...");
try {
  const trackRelsCmd = `curl -s -X POST -H "Content-Type: application/json" -H "X-Hasura-Admin-Secret: ${adminSecret}" -d '{"type":"bulk","args":[{"type":"pg_create_object_relationship","args":{"source":"default","table":"withdrawal_requests","name":"workspace","using":{"foreign_key_constraint_on":"workspace_id"}}},{"type":"pg_create_object_relationship","args":{"source":"default","table":"withdrawal_requests","name":"wallet","using":{"foreign_key_constraint_on":"wallet_id"}}},{"type":"pg_create_object_relationship","args":{"source":"default","table":"withdrawal_requests","name":"wallet_transaction","using":{"foreign_key_constraint_on":"wallet_transaction_id"}}}]}' ${metadataUrl}`;
  const relsRes = JSON.parse(execSync(trackRelsCmd).toString());
  if (relsRes.error) console.log("   Info:", relsRes.error);
  else console.log("   ✅ Relationships created successfully");
} catch (e) {
  console.error("   ❌ Error creating relationships:", e.message);
}

console.log("\n✅ Migration complete!");
