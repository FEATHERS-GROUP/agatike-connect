import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function execute() {
  const trySql = async (sql) => {
    const res = await fetch(`${API_BASE}/v2/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
      body: JSON.stringify({ type: "run_sql", args: { source: "default", sql } }),
    });
    return await res.json();
  };

  let sql1 = `
    ALTER TABLE "platformModules" ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
    UPDATE "platformModules" SET is_premium = true 
    WHERE label NOT IN ('Events', 'Tickets', 'RSVPs', 'Settings', 'Dashboard', 'Withdrawals', 'Users');
  `;
  console.log("Trying platformModules:", await trySql(sql1));

  let sql2 = `
    ALTER TABLE "platform_modules" ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
    UPDATE "platform_modules" SET is_premium = true 
    WHERE label NOT IN ('Events', 'Tickets', 'RSVPs', 'Settings', 'Dashboard', 'Withdrawals', 'Users');
  `;
  console.log("Trying platform_modules:", await trySql(sql2));

  // Reload metadata
  await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({ type: "reload_metadata", args: {} }),
  });
  console.log("Metadata reloaded!");
}

execute();
