import { hasuraRequest } from "./src/api/graphql.server.ts";

async function run() {
  try {
    const res = await fetch("https://open-languages.hasura.app/v2/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE || "",
      },
      body: JSON.stringify({
        type: "run_sql",
        args: {
          sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pricing_plans';",
        },
      }),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
