import { config } from "dotenv";
config();

async function run() {
  const query = {
    type: "run_sql",
    args: {
      sql: `
        ALTER TABLE venue_projects ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;
      `,
      cascade: false,
    },
  };

  const res = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(query),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
