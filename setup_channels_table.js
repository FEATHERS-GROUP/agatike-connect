import { config } from "dotenv";
config();

async function run() {
  const sql = `
    ALTER TABLE community_channels
    ADD COLUMN IF NOT EXISTS schedule_id UUID,
    ADD COLUMN IF NOT EXISTS tour_stop_idx INTEGER;
  `;

  const sqlReq = {
    type: "run_sql",
    args: {
      sql: sql
    }
  };

  const res1 = await fetch(process.env.HASURA_ADMIN_API.replace('v1/graphql', 'v2/query'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(sqlReq),
  });

  console.log("SQL Result:", await res1.text());

  const trackReq = {
    type: "pg_track_table",
    args: {
      source: "default",
      schema: "public",
      name: "community_channels"
    }
  };

  const res2 = await fetch(process.env.HASURA_ADMIN_API.replace('v1/graphql', 'v1/metadata'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(trackReq),
  });

  console.log("Track Result:", await res2.text());

  // If table is already tracked, it might fail the second step. We don't mind.
}

run();
