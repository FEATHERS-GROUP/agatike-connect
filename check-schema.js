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
  const tableTypes = types.filter(
    (t) =>
      !t.name.startsWith("__") &&
      !t.name.includes("_aggregate") &&
      !t.name.includes("_mutation") &&
      !t.name.includes("_input") &&
      !t.name.includes("_response") &&
      !t.name.includes("Query") &&
      !t.name.includes("Mutation") &&
      !t.name.includes("Subscription") &&
      !t.name.endsWith("_enum"),
  );
  console.log("Tables/Types available:");
  tableTypes.forEach((t) => console.log(`- ${t.name}`));
}

run();
