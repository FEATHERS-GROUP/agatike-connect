import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

const BASE_URL = HASURA_API.replace("/v1/graphql", "");

async function runSQL(sql, label) {
  console.log(`\n⏳ ${label}...`);
  const res = await fetch(`${BASE_URL}/v2/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({ type: "run_sql", args: { sql } }),
  });
  const json = await res.json();
  if (json.error) {
    console.error(`❌ ${label} failed:`, json.error);
  } else {
    console.log(`✅ ${label} done`);
  }
  return json;
}

async function trackTable(name, label) {
  console.log(`\n⏳ Tracking ${label}...`);
  const res = await fetch(`${BASE_URL}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "pg_track_table",
      args: { source: "default", schema: "public", name },
    }),
  });
  const json = await res.json();
  if (json.message === "success" || json.code === "already-tracked") {
    console.log(`✅ ${label} tracked`);
  } else {
    console.log(`ℹ️  ${label} track result:`, JSON.stringify(json));
  }
}

async function trackRelationship(table, name, type, args, label) {
  console.log(`\n⏳ Relationship: ${label}...`);
  const res = await fetch(`${BASE_URL}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type,
      args: { source: "default", table, name, using: args },
    }),
  });
  const json = await res.json();
  console.log(`  ${label}:`, json.message || JSON.stringify(json));
}

async function run() {
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_bookings (
      id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      cinema_id        UUID NOT NULL REFERENCES public.cinemas(id) ON DELETE CASCADE,
      schedule_id      UUID NOT NULL REFERENCES public.cinema_schedules(id) ON DELETE CASCADE,
      ticket_tier_id   UUID REFERENCES public.cinema_ticket_tiers(id) ON DELETE SET NULL,
      user_id          UUID,
      email            TEXT,
      names            TEXT,
      phone            TEXT,
      quantity         INTEGER NOT NULL DEFAULT 1,
      total_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency         TEXT NOT NULL DEFAULT 'RWF',
      payment_method   TEXT DEFAULT 'Cash',
      status           TEXT NOT NULL DEFAULT 'confirmed',
      qrcode_number    TEXT UNIQUE,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinema_bookings table",
  );

  await trackTable("cinema_bookings", "cinema_bookings");

  await trackRelationship(
    "cinema_bookings",
    "cinema",
    "pg_create_object_relationship",
    { foreign_key_constraint_on: "cinema_id" },
    "cinema_bookings.cinema",
  );
  await trackRelationship(
    "cinema_bookings",
    "schedule",
    "pg_create_object_relationship",
    { foreign_key_constraint_on: "schedule_id" },
    "cinema_bookings.schedule",
  );
  await trackRelationship(
    "cinema_bookings",
    "ticket_tier",
    "pg_create_object_relationship",
    { foreign_key_constraint_on: "ticket_tier_id" },
    "cinema_bookings.ticket_tier",
  );

  await trackRelationship(
    "cinemas",
    "bookings",
    "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_bookings", column: "cinema_id" } },
    "cinemas.bookings",
  );
  await trackRelationship(
    "cinema_schedules",
    "bookings",
    "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_bookings", column: "schedule_id" } },
    "cinema_schedules.bookings",
  );

  console.log("\n🎬 Cinema Bookings tables created and tracked!\n");
}

run().catch(console.error);
