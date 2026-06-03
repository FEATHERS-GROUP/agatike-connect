import { config } from "dotenv";
config();

async function run() {
  const sql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%voucher%';
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
