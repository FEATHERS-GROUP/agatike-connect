import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("Fixing Users module href from 'Users' to 'users'...");
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `UPDATE public."platformModules" SET href = 'users' WHERE label = 'Users';`,
      },
    }),
  });
  console.log("Result:", await res.json());
}
run();
