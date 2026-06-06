import { config } from "dotenv";
config();

async function run() {
  const req = {
    type: "run_sql",
    args: {
      sql: "ALTER TABLE event_tickets ADD COLUMN form_id uuid NULL;",
      cascade: false
    }
  };

  const res = await fetch("https://open-languages.hasura.app/v2/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(req),
  });
  console.log(await res.json());
}
run();
