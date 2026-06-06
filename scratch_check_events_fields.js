import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      __type(name: "events") {
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
  console.log(JSON.stringify(data.data.__type.fields.map(f => ({ name: f.name, type: f.type.name || f.type.ofType?.name })), null, 2));
}

run();
