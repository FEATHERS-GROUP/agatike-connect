const { hasuraRequest } = require("./src/api/graphql.server.js");
const fetch = require("node-fetch");

const HASURA_URL = "https://open-languages.hasura.app";
const HASURA_SECRET = "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

const runSql = async (sql) => {
  const response = await fetch(`${HASURA_URL}/v2/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: sql,
        cascade: false,
        check_metadata_consistency: false,
      },
    }),
  });
  const data = await response.json();
  if (data.error) {
    console.error("SQL Error:", data.error);
    throw new Error(data.error);
  }
  return data;
};

const trackTable = async (tableName) => {
  const response = await fetch(`${HASURA_URL}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        schema: "public",
        name: tableName,
      },
    }),
  });
  const data = await response.json();
  console.log(`Tracked table ${tableName}:`, data);
};

const sql = `
CREATE TABLE IF NOT EXISTS space_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  space_subscription_id UUID REFERENCES space_subscriptions(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS space_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_percentage NUMERIC,
  flat_amount NUMERIC,
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, code)
);

CREATE TABLE IF NOT EXISTS space_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  workspace_user_id UUID REFERENCES workspace_users(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, workspace_user_id)
);

ALTER TABLE space_subscriptions ADD COLUMN IF NOT EXISTS frozen_until TIMESTAMPTZ;
ALTER TABLE space_subscriptions ADD COLUMN IF NOT EXISTS allowed_space_ids JSONB;
ALTER TABLE space_subscriptions ADD COLUMN IF NOT EXISTS multi_location_fee NUMERIC;

ALTER TABLE space_classes ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES workspace_users(id) ON DELETE SET NULL;
`;

const run = async () => {
  try {
    console.log("Running migrations...");
    await runSql(sql);
    console.log("SQL successful.");

    console.log("Tracking tables...");
    await trackTable("space_check_ins");
    await trackTable("space_promotions");
    await trackTable("space_managers");

    // Track newly added columns automatically by reloading metadata
    const reloadResp = await fetch(`${HASURA_URL}/v1/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_SECRET,
      },
      body: JSON.stringify({
        type: "reload_metadata",
        args: {
          reload_remote_schemas: true,
          reload_sources: false,
          recreate_event_triggers: false,
        },
      }),
    });
    console.log("Reload metadata:", await reloadResp.json());

    console.log("Migration complete!");
  } catch (e) {
    console.error("Migration failed:", e);
  }
};

run();
