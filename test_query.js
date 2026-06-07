import { config } from "dotenv";
config();
async function run() {
  const query = `
    query GetEventsForChannels($ids: [uuid!]!) {
      events(where: {id: {_in: $ids}}) {
        id
        tour_stops
        schedules {
          id
          start_date
          end_date
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
    body: JSON.stringify({ query, variables: { ids: ["4217c9e6-5808-4780-97de-86441cd4b099"] } }),
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}
run();
