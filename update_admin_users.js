import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API?.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  if (!API_BASE || !SECRET) {
    console.error("HASURA_ADMIN_API or HASURA_ADMIN_SECRETE is missing in .env");
    return;
  }

  console.log("1. Altering admin_users table...");
  const alterRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS password text;
          ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;
        `,
      },
    }),
  });

  const alterData = await alterRes.json();
  if (alterData.error) {
    console.error("Error altering table:", alterData.error);
  } else {
    console.log("Table altered!");
  }

  console.log("2. Seeding super admin user...");
  const hashedPassword = await bcrypt.hash("SuperAdmin@123!", 10);

  const seedRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          INSERT INTO public.admin_users (email, name, role, password, is_super_admin)
          VALUES ('admin@agatike.com', 'Global Admin', 'super_admin', '${hashedPassword}', true)
          ON CONFLICT (email) DO UPDATE SET 
            password = EXCLUDED.password,
            is_super_admin = true,
            role = 'super_admin';
        `,
      },
    }),
  });

  const seedData = await seedRes.json();
  if (seedData.error) {
    console.error("Error seeding super admin:", seedData.error);
  } else {
    console.log(
      "Super admin seeded successfully! Email: admin@agatike.com, Password: SuperAdmin@123!",
    );
  }
}

run();
