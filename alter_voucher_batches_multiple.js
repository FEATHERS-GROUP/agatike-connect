import { config } from "dotenv";
config();

async function run() {
  const sql = `
    ALTER TABLE sponsored_voucher_batches 
    DROP COLUMN IF EXISTS linked_ticket_id;
    
    ALTER TABLE sponsored_voucher_batches 
    ADD COLUMN IF NOT EXISTS linked_ticket_ids jsonb DEFAULT '[]'::jsonb;
  `;

  console.log("Running SQL...");
  const sqlRes = await fetch(process.env.HASURA_ADMIN_API.replace("/graphql", "/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { sql, cascade: false },
    }),
  });
  console.log(await sqlRes.json());
}
run();
