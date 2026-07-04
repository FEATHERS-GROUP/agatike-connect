const https = require("https");

const HASURA_ENDPOINT = "https://open-languages.hasura.app/v2/query";
const ADMIN_SECRET =
  process.env.HASURA_ADMIN_SECRET ||
  "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

async function executeMigration() {
  console.log("Starting DB migration for wallet_transactions fee...");

  const operations = [
    `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;`,
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
          },
        );
        req.on("error", reject);
        req.write(JSON.stringify({ type: "run_sql", args: { sql, cascade: false } }));
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
        headers: { "Content-Type": "application/json", "X-Hasura-Admin-Secret": ADMIN_SECRET },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve());
      },
    );
    req.write(JSON.stringify({ type: "reload_metadata", args: { reload_remote_schemas: true } }));
    req.end();
  });
}

executeMigration().catch(console.error);
