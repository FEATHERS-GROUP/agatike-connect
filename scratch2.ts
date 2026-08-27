const fs = require("fs");
const { hasuraRequest } = require("./src/api/graphql.server.ts");

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
        template
      }
    }
  `;
  try {
     const res = await hasuraRequest(query, {});
     console.log(JSON.stringify(res, null, 2));
  } catch(e) {
     console.log(e);
  }
}
run();
