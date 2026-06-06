import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      __type(name: "event_attendees") {
        fields {
          name
          type { name kind ofType { name kind } }
        }
      }
      ticketsType: __type(name: "event_tickets") {
        fields {
          name
          type { name kind ofType { name kind } }
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
  console.log(JSON.stringify(data.data, null, 2));
}

run();
