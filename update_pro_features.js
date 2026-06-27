import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

const sql = `
  UPDATE pricing_plans
  SET features = (
    SELECT jsonb_agg(
      CASE 
        WHEN elem::text = '"Custom Ticket Designer"' THEN '"Agatike Studio"'::jsonb 
        ELSE elem 
      END
    )
    FROM jsonb_array_elements(features) AS elem
  )
  WHERE features @> '["Custom Ticket Designer"]'::jsonb;
`;

async function execute() {
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({ type: "run_sql", args: { source: "default", sql } }),
  });
  const data = await res.json();
  console.log("SQL Result:", data);
}

execute();
