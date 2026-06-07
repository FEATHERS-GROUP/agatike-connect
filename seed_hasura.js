import { config } from "dotenv";
config();

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v2/query');
  
  const payload = {
    type: "run_sql",
    args: {
      sql: `
        UPDATE organizers SET followers = 2 WHERE id = '0fa59d30-9e09-43e6-82d3-0ff0c7a883aa';
        
        INSERT INTO organizer_followers (organizer_id, user_id) 
        VALUES ('0fa59d30-9e09-43e6-82d3-0ff0c7a883aa', '["1620aa9e-2273-4777-beb7-7bdebd0e1f06", "c1a2dbcd-e9f5-47ad-a9c2-b2b784e9b648"]'::jsonb)
        ON CONFLICT (organizer_id) DO UPDATE 
        SET user_id = '["1620aa9e-2273-4777-beb7-7bdebd0e1f06", "c1a2dbcd-e9f5-47ad-a9c2-b2b784e9b648"]'::jsonb;
      `
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  console.log("Hasura Data Seed:", JSON.stringify(data, null, 2));
}

run();
