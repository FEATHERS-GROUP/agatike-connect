import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    CREATE TABLE public.spaces (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      workspace_id UUID NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      currency TEXT NOT NULL DEFAULT 'RWF',
      cover_url TEXT,
      socials JSONB DEFAULT '{}'::jsonb,
      locations JSONB DEFAULT '[]'::jsonb,
      plans JSONB DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 1. Run SQL to create table
  console.log("Creating spaces table...");
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

  // 2. Track the table
  console.log("Tracking spaces table...");
  const trackRes = await fetch(HASURA_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        schema: "public",
        name: "spaces",
      },
    }),
  });
  console.log(await trackRes.json());
}

run();
