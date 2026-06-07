import { config } from "dotenv";
config();

async function run() {
  // Replace /v1/graphql with /v2/query for schema operations
  const url = process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v2/query');
  
  const payload = {
    type: "bulk",
    args: [
      {
        type: "run_sql",
        args: {
          sql: `
            DROP TABLE IF EXISTS organizer_followers CASCADE;
            CREATE TABLE organizer_followers (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              organizer_id UUID NOT NULL,
              user_id TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(organizer_id, user_id)
            );
          `
        }
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(payload),
  });
  
  console.log(JSON.stringify(await res.json(), null, 2));
}

run();
