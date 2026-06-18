import fetch from "node-fetch";
import { config } from "dotenv";

config();

async function check() {
  const query = {
    type: "bulk",
    args: [
      {
        type: "run_sql",
        args: {
          sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices';",
        },
      },
    ],
  };

  const res = await fetch(process.env.VITE_HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.VITE_HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify(query),
  });

  console.log(JSON.stringify(await res.json(), null, 2));
}

check().catch(console.error);
