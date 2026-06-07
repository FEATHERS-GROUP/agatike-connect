import { config } from "dotenv";
config();

async function run() {
  const payload = {
    type: "run_sql",
    args: {
      sql: "SELECT 1 as test;"
    }
  };

  const res = await fetch(process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v2/query'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(payload),
  });
  console.log(await res.json());
}
run();
