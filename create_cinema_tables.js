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
  // ─────────────────────────────────────────────────────────────────────────
  // 1. cinemas — the main venue table
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinemas (
      id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      workspace_id  UUID NOT NULL,
      name          TEXT NOT NULL,
      description   TEXT,
      city          TEXT,
      address       TEXT,
      country       TEXT DEFAULT 'Rwanda',
      cover_url     TEXT,
      logo_url      TEXT,
      phone         TEXT,
      email         TEXT,
      website       TEXT,
      socials       JSONB DEFAULT '{}'::jsonb,
      settings      JSONB DEFAULT '{}'::jsonb,
      status        TEXT NOT NULL DEFAULT 'active',
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinemas table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 2. cinema_screens — the screen halls / rooms inside a cinema
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_screens (
      id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      cinema_id      UUID NOT NULL REFERENCES public.cinemas(id) ON DELETE CASCADE,
      name           TEXT NOT NULL,
      screen_type    TEXT NOT NULL DEFAULT 'standard',
      capacity       INTEGER NOT NULL DEFAULT 100,
      has_3d         BOOLEAN NOT NULL DEFAULT false,
      has_imax       BOOLEAN NOT NULL DEFAULT false,
      has_dolby      BOOLEAN NOT NULL DEFAULT false,
      has_4dx        BOOLEAN NOT NULL DEFAULT false,
      seating_layout JSONB DEFAULT '{}'::jsonb,
      status         TEXT NOT NULL DEFAULT 'active',
      created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinema_screens table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 3. cinema_movies — the global film catalog
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_movies (
      id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      workspace_id     UUID NOT NULL,
      title            TEXT NOT NULL,
      synopsis         TEXT,
      genre            TEXT,
      duration_minutes INTEGER,
      release_date     DATE,
      cover_url        TEXT,
      trailer_url      TEXT,
      rating           TEXT DEFAULT 'PG-13',
      language         TEXT DEFAULT 'English',
      director         TEXT,
      cast_list        JSONB DEFAULT '[]'::jsonb,
      distributor      TEXT,
      is_3d            BOOLEAN NOT NULL DEFAULT false,
      is_imax          BOOLEAN NOT NULL DEFAULT false,
      tags             JSONB DEFAULT '[]'::jsonb,
      status           TEXT NOT NULL DEFAULT 'coming_soon',
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinema_movies table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. cinema_schedules — show schedules linking movies → screens → cinemas
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_schedules (
      id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      cinema_id     UUID NOT NULL REFERENCES public.cinemas(id) ON DELETE CASCADE,
      screen_id     UUID NOT NULL REFERENCES public.cinema_screens(id) ON DELETE CASCADE,
      movie_id      UUID NOT NULL REFERENCES public.cinema_movies(id) ON DELETE CASCADE,
      show_date     DATE NOT NULL,
      start_time    TIME NOT NULL,
      end_time      TIME,
      language      TEXT DEFAULT 'English',
      subtitles     TEXT,
      is_premiere   BOOLEAN NOT NULL DEFAULT false,
      is_3d         BOOLEAN NOT NULL DEFAULT false,
      is_imax       BOOLEAN NOT NULL DEFAULT false,
      base_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency      TEXT NOT NULL DEFAULT 'RWF',
      total_seats   INTEGER NOT NULL DEFAULT 0,
      booked_seats  INTEGER NOT NULL DEFAULT 0,
      status        TEXT NOT NULL DEFAULT 'scheduled',
      notes         TEXT,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinema_schedules table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 5. cinema_ticket_tiers — global ticket tier definitions (already may exist)
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_ticket_tiers (
      id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      workspace_id     UUID NOT NULL,
      name             TEXT NOT NULL,
      description      TEXT,
      type             TEXT NOT NULL DEFAULT 'standard',
      price            NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency         TEXT NOT NULL DEFAULT 'RWF',
      includes_glasses BOOLEAN NOT NULL DEFAULT false,
      is_kids          BOOLEAN NOT NULL DEFAULT false,
      is_vip           BOOLEAN NOT NULL DEFAULT false,
      is_3d            BOOLEAN NOT NULL DEFAULT false,
      is_imax          BOOLEAN NOT NULL DEFAULT false,
      extras           JSONB DEFAULT '{}'::jsonb,
      status           TEXT NOT NULL DEFAULT 'active',
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinema_ticket_tiers table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 6. cinema_schedule_ticket_tiers — links ticket tiers to specific shows
  //    (price can be overridden per show)
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_schedule_ticket_tiers (
      id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      schedule_id     UUID NOT NULL REFERENCES public.cinema_schedules(id) ON DELETE CASCADE,
      ticket_tier_id  UUID NOT NULL REFERENCES public.cinema_ticket_tiers(id) ON DELETE CASCADE,
      price_override  NUMERIC(12,2),
      currency        TEXT DEFAULT 'RWF',
      available_seats INTEGER NOT NULL DEFAULT 0,
      sold_seats      INTEGER NOT NULL DEFAULT 0,
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    "Create cinema_schedule_ticket_tiers junction table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 7. cinema_movie_cinemas — which cinema is showing which movie
  // ─────────────────────────────────────────────────────────────────────────
  await runSQL(
    `
    CREATE TABLE IF NOT EXISTS public.cinema_movie_cinemas (
      id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      cinema_id  UUID NOT NULL REFERENCES public.cinemas(id) ON DELETE CASCADE,
      movie_id   UUID NOT NULL REFERENCES public.cinema_movies(id) ON DELETE CASCADE,
      status     TEXT NOT NULL DEFAULT 'now_showing',
      added_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (cinema_id, movie_id)
    );
    `,
    "Create cinema_movie_cinemas junction table"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Track all tables in Hasura
  // ─────────────────────────────────────────────────────────────────────────
  await trackTable("cinemas", "cinemas");
  await trackTable("cinema_screens", "cinema_screens");
  await trackTable("cinema_movies", "cinema_movies");
  await trackTable("cinema_schedules", "cinema_schedules");
  await trackTable("cinema_ticket_tiers", "cinema_ticket_tiers");
  await trackTable("cinema_schedule_ticket_tiers", "cinema_schedule_ticket_tiers");
  await trackTable("cinema_movie_cinemas", "cinema_movie_cinemas");

  // ─────────────────────────────────────────────────────────────────────────
  // Track foreign key relationships for GraphQL
  // ─────────────────────────────────────────────────────────────────────────

  // cinema_screens → cinemas
  await trackRelationship(
    "cinema_screens", "cinema", "pg_create_object_relationship",
    { foreign_key_constraint_on: "cinema_id" },
    "cinema_screens.cinema"
  );
  await trackRelationship(
    "cinemas", "screens", "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_screens", column: "cinema_id" } },
    "cinemas.screens"
  );

  // cinema_schedules → cinema, screen, movie
  await trackRelationship(
    "cinema_schedules", "cinema", "pg_create_object_relationship",
    { foreign_key_constraint_on: "cinema_id" },
    "cinema_schedules.cinema"
  );
  await trackRelationship(
    "cinema_schedules", "screen", "pg_create_object_relationship",
    { foreign_key_constraint_on: "screen_id" },
    "cinema_schedules.screen"
  );
  await trackRelationship(
    "cinema_schedules", "movie", "pg_create_object_relationship",
    { foreign_key_constraint_on: "movie_id" },
    "cinema_schedules.movie"
  );
  await trackRelationship(
    "cinemas", "schedules", "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_schedules", column: "cinema_id" } },
    "cinemas.schedules"
  );
  await trackRelationship(
    "cinema_movies", "schedules", "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_schedules", column: "movie_id" } },
    "cinema_movies.schedules"
  );

  // cinema_schedule_ticket_tiers relationships
  await trackRelationship(
    "cinema_schedule_ticket_tiers", "schedule", "pg_create_object_relationship",
    { foreign_key_constraint_on: "schedule_id" },
    "cinema_schedule_ticket_tiers.schedule"
  );
  await trackRelationship(
    "cinema_schedule_ticket_tiers", "ticket_tier", "pg_create_object_relationship",
    { foreign_key_constraint_on: "ticket_tier_id" },
    "cinema_schedule_ticket_tiers.ticket_tier"
  );
  await trackRelationship(
    "cinema_schedules", "ticket_tiers", "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_schedule_ticket_tiers", column: "schedule_id" } },
    "cinema_schedules.ticket_tiers"
  );

  // cinema_movie_cinemas relationships
  await trackRelationship(
    "cinema_movie_cinemas", "cinema", "pg_create_object_relationship",
    { foreign_key_constraint_on: "cinema_id" },
    "cinema_movie_cinemas.cinema"
  );
  await trackRelationship(
    "cinema_movie_cinemas", "movie", "pg_create_object_relationship",
    { foreign_key_constraint_on: "movie_id" },
    "cinema_movie_cinemas.movie"
  );
  await trackRelationship(
    "cinemas", "movies", "pg_create_array_relationship",
    { foreign_key_constraint_on: { table: "cinema_movie_cinemas", column: "cinema_id" } },
    "cinemas.movies"
  );

  console.log("\n🎬 All cinema tables created, tracked and relationships set up!\n");
}

run().catch(console.error);
