import { config } from "dotenv";
config();

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query");
  const headers = {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  };

  // 1. Create vip_privileges table
  console.log("Creating `vip_privileges` table...");
  const createTableRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: `
          CREATE TABLE IF NOT EXISTS vip_privileges (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name text NOT NULL,
            description text,
            icon text,
            fields jsonb DEFAULT '[]'::jsonb NOT NULL,
            created_at timestamptz DEFAULT now() NOT NULL,
            updated_at timestamptz DEFAULT now() NOT NULL
          );

          -- Create trigger to auto update updated_at
          CREATE OR REPLACE FUNCTION set_current_timestamp_updated_at()
          RETURNS trigger AS $$
          DECLARE
            _new record;
          BEGIN
            _new := NEW;
            _new."updated_at" = NOW();
            RETURN _new;
          END;
          $$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS set_public_vip_privileges_updated_at ON vip_privileges;
          CREATE TRIGGER set_public_vip_privileges_updated_at
          BEFORE UPDATE ON vip_privileges
          FOR EACH ROW
          EXECUTE PROCEDURE set_current_timestamp_updated_at();
        `,
      },
    }),
  });
  console.log("Create table result:", await createTableRes.json());

  // 2. Track vip_privileges table in Hasura
  console.log("Tracking `vip_privileges` table...");
  const trackTableRes = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        schema: "public",
        name: "vip_privileges"
      },
    }),
  });
  console.log("Track table result:", await trackTableRes.json());

  // 3. Add `vip_privilege_ids` to `event_tickets` (Already added successfully, but we can keep it as IF NOT EXISTS)
  console.log("Adding `vip_privilege_ids` column to event_tickets table...");
  const alterTicketsRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: "ALTER TABLE event_tickets ADD COLUMN IF NOT EXISTS vip_privilege_ids jsonb DEFAULT '[]'::jsonb;",
      },
    }),
  });
  console.log("Alter event_tickets result:", await alterTicketsRes.json());

  // 4. Reload metadata
  console.log("Reloading Hasura metadata...");
  const metadataRes = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "reload_metadata",
      args: {
        reload_remote_schemas: true,
        reload_sources: true,
      },
    }),
  });
  console.log("Metadata result:", await metadataRes.json());

  console.log("Database migration complete!");
}

run();
