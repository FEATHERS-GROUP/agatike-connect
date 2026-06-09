import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    ALTER TABLE public.venue_bookings 
    ADD COLUMN IF NOT EXISTS user_id uuid;

    -- Create foreign key to users if not exists
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'venue_bookings_user_id_fkey') THEN 
        ALTER TABLE public.venue_bookings 
          ADD CONSTRAINT venue_bookings_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
      END IF; 
    END $$;
  `;

  console.log("Updating venue_bookings table...");
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

  console.log("Tracking object relationship...");
  const trackRes = await fetch(HASURA_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "pg_create_object_relationship",
      args: {
        source: "default",
        table: "venue_bookings",
        name: "user",
        using: {
          foreign_key_constraint_on: "user_id"
        }
      },
    }),
  });
  console.log(await trackRes.json());
}

run();
