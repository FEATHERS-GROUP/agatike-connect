import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.venue_bookings (
      id uuid DEFAULT public.gen_random_uuid() NOT NULL PRIMARY KEY,
      workspace_id uuid NOT NULL,
      venue_id uuid NOT NULL,
      customer_name text NOT NULL,
      customer_email text,
      customer_phone text,
      customer_id_document text,
      start_time timestamp with time zone NOT NULL,
      end_time timestamp with time zone NOT NULL,
      status text DEFAULT 'Pending'::text NOT NULL,
      payment_status text DEFAULT 'Unpaid'::text NOT NULL,
      amount numeric DEFAULT 0 NOT NULL,
      number_of_attendees integer,
      tickets_data jsonb,
      attendees_info jsonb,
      internal_notes text,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );

    -- Create foreign key to rentable_venues if not exists
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'venue_bookings_venue_id_fkey') THEN 
        ALTER TABLE public.venue_bookings 
          ADD CONSTRAINT venue_bookings_venue_id_fkey 
          FOREIGN KEY (venue_id) REFERENCES public.rentable_venues(id) ON DELETE CASCADE;
      END IF; 
    END $$;
  `;

  console.log("Creating venue_bookings table...");
  const sqlRes = await fetch(HASURA_API.replace('/v1/graphql', '/v2/query'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { sql }
    }),
  });
  console.log(await sqlRes.json());
  
  console.log("Tracking table in Hasura...");
  const trackRes = await fetch(HASURA_API.replace('/v1/graphql', '/v1/metadata'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "venue_bookings"
      }
    }),
  });
  console.log(await trackRes.json());
}

run();
