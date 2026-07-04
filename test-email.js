import { hasuraRequest } from "./src/api/graphql.server.js";

async function main() {
  const query = `
    query GetOrganizer($id: uuid!) {
      organizers_by_pk(id: $id) {
        email
      }
    }
  `;
  const result = await hasuraRequest(query, {
    id: "245db241-b900-4bcc-9314-dab54498e84a",
  });
  console.log(result);
}
main();
