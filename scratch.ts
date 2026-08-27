import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  const query = `
    query {
      ticket_projects(order_by: {updated_on: desc}, limit: 5) {
        id
        name
        eventId
        palette
        font
        coverImage
        logoText
      }
    }
  `;
  const res = await hasuraRequest(query, {});
  console.dir(res, { depth: null });
}
run();
