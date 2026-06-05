const HASURA_URL = "https://advanced-tarpon-30.hasura.app/v1/graphql";

// Get secret from .env if possible, or maybe I don't have it.
// Wait, I can read config.server.ts by importing it?
// Let's just use the graphql introspection query to see the columns of workspaces.

async function checkSchema() {
  const query = `
    query {
      __type(name: "workspaces") {
        fields {
          name
        }
      }
    }
  `;

  // We need x-hasura-admin-secret. I will read it from .env
  const fs = await import('fs/promises');
  const envFile = await fs.readFile('.env', 'utf-8');
  const match = envFile.match(/HASURA_GRAPHQL_ADMIN_SECRET=([^\n]+)/);
  const secret = match ? match[1] : '';

  const response = await fetch(HASURA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": secret,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  console.log(JSON.stringify(json.data.__type.fields.map(f => f.name), null, 2));
}

checkSchema().catch(console.error);
