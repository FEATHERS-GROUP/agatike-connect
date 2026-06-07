import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    ALTER TABLE public.ticket_projects ADD COLUMN IF NOT EXISTS "venueId" uuid;
    
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_projects_venueId_fkey') THEN 
        ALTER TABLE public.ticket_projects 
          ADD CONSTRAINT "ticket_projects_venueId_fkey" 
          FOREIGN KEY ("venueId") REFERENCES public.rentable_venues(id) ON DELETE CASCADE;
      END IF; 
    END $$;
  `;

  console.log("Adding venueId to ticket_projects...");
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
  
  console.log("Tracking column in Hasura metadata...");
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
        table: "ticket_projects"
      }
    }),
  });
  // pg_track_table tracks missing columns if already tracked.
  console.log(await trackRes.json());
}

run();
