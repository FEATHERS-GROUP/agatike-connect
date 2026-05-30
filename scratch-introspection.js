import { config } from "dotenv";
config();

async function run() {
  const query = `
    query IntrospectionQuery {
      __type(name: "event_tickets") {
        name
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  `;

  const response = await fetch(process.env.VITE_HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

run();
