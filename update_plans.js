import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

const basicModules = JSON.stringify([
  "86b63107-75bb-4e95-8e31-452fa2c975b3", // Events
  "b8d914d5-d94f-4ab1-adda-45a8a203da6f", // Tickets
  "93c085da-f1da-4f2b-9cab-b12327a3a532", // RSVPs
  "991aa862-ef0e-4d14-b06f-a1a2db39d357", // Settings
  "46202409-b7cc-44ac-8055-6725497439f4", // Dashboard
  "1c7961f2-4a9f-4da7-ab7a-a854d9e50edf", // Withdrawals
  "97eea8bd-1c6c-4394-a6fb-aa867c7655c7", // Users
]);

const proModules = JSON.stringify([
  "86b63107-75bb-4e95-8e31-452fa2c975b3",
  "b8d914d5-d94f-4ab1-adda-45a8a203da6f",
  "93c085da-f1da-4f2b-9cab-b12327a3a532",
  "991aa862-ef0e-4d14-b06f-a1a2db39d357",
  "46202409-b7cc-44ac-8055-6725497439f4",
  "1c7961f2-4a9f-4da7-ab7a-a854d9e50edf",
  "97eea8bd-1c6c-4394-a6fb-aa867c7655c7",
  "4afadcf5-2985-4418-b6af-27d40271ec07", // VIP Access
  "87435881-b6d3-4701-ad99-e89125a82319", // Venue Listings
  "6ec62138-9d76-4edf-b1bb-88efbafb8e3d", // Venue Designer
  "8d98adf8-eb3c-4c09-879a-97867e3a9cca", // Experiences
  "0d10ef50-5f3b-4cd6-acb3-88f6e841d1b3", // Products & Add-ons
  "34b214ad-0123-4d3e-826b-54657c88ecca", // Page Builder
  "34648430-c4f5-4e17-bb5e-27c908711138", // Badge Designer
  "44bd4978-d56a-40b0-b303-b255ea4dc14b", // Community
  "2023e384-e356-41d8-be1b-ce3344c0bbe7", // Spaces
]);

const enterpriseModules = JSON.stringify([
  "ALL"
]);

const updateSQL = `
  UPDATE pricing_plans SET modules_included = '${basicModules}'::jsonb WHERE name = 'Basic';
  UPDATE pricing_plans SET modules_included = '${proModules}'::jsonb WHERE name = 'Pro Organizer';
  UPDATE pricing_plans SET modules_included = '${enterpriseModules}'::jsonb WHERE name = 'Enterprise';
`;

async function run() {
  console.log("Running SQL to update modules in pricing_plans...");
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: updateSQL,
      },
    }),
  });
  
  const json = await res.json();
  if (json.error) {
    console.error("Error updating plans:", json.error);
  } else {
    console.log("Success! Pricing plans updated with all platform modules.");
  }
}
run();
