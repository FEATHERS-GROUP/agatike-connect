import { config } from "dotenv";
config();

async function runSQL(sql) {
  const query = {
    type: "bulk",
    args: [
      {
        type: "run_sql",
        args: { sql, cascade: true }
      }
    ]
  };

  const res = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/query'), {
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

async function main() {
  const sql = `
    ALTER TABLE event_schedules 
    ADD COLUMN IF NOT EXISTS total_spots INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS spots_filled INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

    ALTER TABLE event_attendees 
    ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES event_schedules(id) ON DELETE SET NULL;
  `;
  await runSQL(sql);
}

main();
