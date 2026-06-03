import { config } from "dotenv";
config();

async function run() {
  const sql = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'voucher_transactions';
  `;

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
