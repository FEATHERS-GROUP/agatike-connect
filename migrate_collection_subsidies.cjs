const https = require("https");

const HASURA_ENDPOINT = "https://open-languages.hasura.app/v2/query";
const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

async function executeMigration() {
  console.log("Starting DB migration for collection subsidies...");

  const operations = [
    // 1. Add fields to pricing_plans
    `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS max_collection_subsidy_percentage numeric DEFAULT 1.0;`,
    `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS enable_subsidized_collection boolean DEFAULT true;`,
    `ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS withdrawal_dependency_required boolean DEFAULT true;`,

    // 2. Add telemetry fields to fee_simulations
    `ALTER TABLE fee_simulations ADD COLUMN IF NOT EXISTS guaranteed_revenue numeric;`,
    `ALTER TABLE fee_simulations ADD COLUMN IF NOT EXISTS optional_revenue numeric;`,
    `ALTER TABLE fee_simulations ADD COLUMN IF NOT EXISTS provider_cost numeric;`,
    `ALTER TABLE fee_simulations ADD COLUMN IF NOT EXISTS subsidy_amount numeric;`,
    `ALTER TABLE fee_simulations ADD COLUMN IF NOT EXISTS max_allowed_subsidy numeric;`,
    `ALTER TABLE fee_simulations ADD COLUMN IF NOT EXISTS lifecycle_mode text;`,
  ];

  for (const sql of operations) {
    try {
      console.log(`Executing: ${sql}`);
      const response = await new Promise((resolve, reject) => {
        const req = https.request(
          HASURA_ENDPOINT,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Hasura-Admin-Secret": ADMIN_SECRET,
            },
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(JSON.parse(data));
              } else {
                reject(new Error(`Hasura Error (${res.statusCode}): ${data}`));
              }
            });
          }
        );
        req.on("error", reject);
        req.write(
          JSON.stringify({
            type: "run_sql",
            args: { sql, cascade: false },
          })
        );
        req.end();
      });
      console.log("Success:", JSON.stringify(response).substring(0, 100));
    } catch (e) {
      console.error(`Error executing SQL:`, e.message);
    }
  }

  console.log("Reloading Hasura Metadata...");
  await new Promise((resolve, reject) => {
    const req = https.request(
      "https://open-languages.hasura.app/v1/metadata",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hasura-Admin-Secret": ADMIN_SECRET,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("Metadata reloaded.");
            resolve();
          } else {
            reject(new Error(`Failed to reload metadata: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(JSON.stringify({ type: "reload_metadata", args: { reload_remote_schemas: true } }));
    req.end();
  });

  console.log("Migration complete.");
}

executeMigration().catch(console.error);
