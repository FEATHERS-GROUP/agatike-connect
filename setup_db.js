import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("1. Creating table...");
  const createRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          CREATE TABLE IF NOT EXISTS public.organizer_users (
              id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
              organizer_id uuid NOT NULL,
              user_id uuid NOT NULL,
              role text DEFAULT 'owner'::text NOT NULL,
              created_at timestamp with time zone DEFAULT now() NOT NULL,
              CONSTRAINT uq_organizer_user UNIQUE (organizer_id, user_id)
          );
        `,
      },
    }),
  });

  const createData = await createRes.json();
  if (createData.error) {
    console.error("Error creating table:", createData.error);
    // Ignore error if table exists
  } else {
    console.log("Table created!");
  }

  console.log("2. Tracking table...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "organizer_users",
      },
    }),
  });
  console.log("Track table:", await trackRes.json());
  console.log("3. Updating spaces table...");
  const updateSpacesRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS rsvp_form_id uuid;
          ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS page_id uuid;
          ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS show_rsvp_form_button boolean DEFAULT true;
          ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS rsvp_form_button_text text DEFAULT 'Fill out our form';
          ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS connected_forms jsonb DEFAULT '[]'::jsonb;
          
          CREATE TABLE IF NOT EXISTS public.space_subscriptions (
              id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
              space_id uuid NOT NULL,
              user_id uuid,
              customer_name text NOT NULL,
              customer_email text NOT NULL,
              customer_phone text NOT NULL,
              plan_name text NOT NULL,
              price text NOT NULL,
              billing_cycle text NOT NULL,
              status text DEFAULT 'active'::text NOT NULL,
              start_date timestamp with time zone DEFAULT now() NOT NULL,
              next_billing_date timestamp with time zone,
              created_at timestamp with time zone DEFAULT now() NOT NULL
          );
          
          ALTER TABLE public.space_subscriptions ADD COLUMN IF NOT EXISTS customer_gender text;
        `,
      },
    }),
  });
  const updateSpacesData = await updateSpacesRes.json();
  if (updateSpacesData.error) {
    console.error("Error updating spaces table:", updateSpacesData.error);
  } else {
    console.log("Spaces & subscriptions tables updated!");
  }

  console.log("4. Tracking space_subscriptions table...");
  const trackSubRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "space_subscriptions",
      },
    }),
  });
  console.log("Track space_subscriptions:", await trackSubRes.json());
}

run();
