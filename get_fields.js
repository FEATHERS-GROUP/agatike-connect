import { config } from "dotenv";
config();

async function run() {
  const query = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
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

  const targetTables = ["wallets", "wallet_transactions", "product_orders"];

  for (const t of types) {
    if (targetTables.includes(t.name)) {
      console.log(`\nTable: ${t.name}`);
      t.fields.forEach((f) => {
        let typeName = f.type.name || f.type.ofType?.name || "unknown";
        console.log(`  - ${f.name} (${typeName})`);
      });
    }
  }
}
run();
