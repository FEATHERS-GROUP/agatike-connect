import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const query = {
    type: "bulk",
    args: [
      // Drop pdf_url
      {
        type: "run_sql",
        args: {
          sql: "ALTER TABLE invoices DROP COLUMN IF EXISTS pdf_url;"
        }
      },
      // Add space_subscription_id
      {
        type: "run_sql",
        args: {
          sql: "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS space_subscription_id uuid REFERENCES space_subscriptions(id) ON DELETE SET NULL;"
        }
      }
    ]
  };

  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify(query)
  });

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));

  // If successful, we should also track the relationship in Hasura metadata
  if (!json.error && !json.code) {
      const metaQuery = {
        type: "pg_create_object_relationship",
        args: {
          table: "invoices",
          name: "space_subscription",
          using: {
            foreign_key_constraint_on: "space_subscription_id"
          }
        }
      };
      
      const metaRes = await fetch(`${API_BASE}/v1/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": SECRET,
        },
        body: JSON.stringify(metaQuery)
      });
      console.log("Metadata response:", await metaRes.text());
  }
}

run().catch(console.error);
