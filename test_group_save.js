import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API?.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const query = `
    mutation CreateAdminGroup($name: String!, $permissions: jsonb!) {
      insert_admin_groups_one(object: { name: $name, permissions: $permissions }) {
        id
      }
    }
  `;

  const response = await fetch(`${API_BASE}/v1/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      query,
      variables: {
        name: "Test Group",
        permissions: ["/internal/control/admin/dashboard"],
      },
    }),
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

run();
