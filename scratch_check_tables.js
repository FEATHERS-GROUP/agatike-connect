import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      __schema {
        types {
          name
          kind
        }
      }
    }
  `;

  const res = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  const tables = data.data.__schema.types
    .filter(t => t.kind === "OBJECT" && !t.name.startsWith("__") && !t.name.endsWith("_mutation_response"))
    .map(t => t.name);
  console.log(tables);
}

run();
