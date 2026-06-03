import { config } from "dotenv";
config();

async function run() {
  const query = `
    query IntrospectionQuery {
      __schema {
        types {
          name
        }
      }
    }
  `;
  const response = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });
  const json = await response.json();
  const types = json.data.__schema.types;
  const targetTables = types.filter(
    (t) => t.name.includes("order") || t.name.includes("transaction"),
  );
  targetTables.forEach((t) => console.log(t.name));
}
run();
