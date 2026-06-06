import { config } from "dotenv";
config();

async function run() {
  const adminSecret = process.env.HASURA_ADMIN_SECRETE;
  const url = process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v1/metadata');
  const sqlUrl = process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v2/query');

  // 1. Create table
  console.log("Creating table...");
  const sql = `
    CREATE TABLE IF NOT EXISTS event_schedules (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id UUID REFERENCES events(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  const sqlRes = await fetch(sqlUrl, {
    method: "POST",
    headers: { "x-hasura-admin-secret": adminSecret, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "run_sql", args: { sql, cascade: true } })
  });
  console.log(await sqlRes.json());

  // 2. Track table
  console.log("Tracking table...");
  const trackRes = await fetch(url, {
    method: "POST",
    headers: { "x-hasura-admin-secret": adminSecret, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "pg_track_table",
      args: { table: "event_schedules" }
    })
  });
  console.log(await trackRes.json());

  // 3. Create array relationship on events
  console.log("Creating array relationship on events...");
  const arrRelRes = await fetch(url, {
    method: "POST",
    headers: { "x-hasura-admin-secret": adminSecret, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "pg_create_array_relationship",
      args: {
        table: "events",
        name: "schedules",
        using: {
          foreign_key_constraint_on: {
            table: "event_schedules",
            column: "event_id"
          }
        }
      }
    })
  });
  console.log(await arrRelRes.json());

  // 4. Create object relationship on event_schedules
  console.log("Creating object relationship on event_schedules...");
  const objRelRes = await fetch(url, {
    method: "POST",
    headers: { "x-hasura-admin-secret": adminSecret, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "pg_create_object_relationship",
      args: {
        table: "event_schedules",
        name: "event",
        using: {
          foreign_key_constraint_on: "event_id"
        }
      }
    })
  });
  console.log(await objRelRes.json());
}
run();
