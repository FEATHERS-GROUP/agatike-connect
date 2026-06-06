import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      events(where: {event_type: {_eq: "experience"}}, order_by: {created_at: desc}, limit: 1) {
        id
        title
        event_requency
        tour_stops
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
