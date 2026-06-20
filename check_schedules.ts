import { hasuraRequest } from "./src/api/graphql.server";

async function main() {
  const query = `
    query GetAllSchedules {
      cinema_schedules(limit: 5) {
        id
        status
        show_date
        start_time
        cinema_id
        movie_id
      }
    }
  `;
  try {
    const res = await hasuraRequest(query);
    console.log("Schedules:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
