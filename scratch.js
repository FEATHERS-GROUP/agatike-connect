const { request, gql } = require("graphql-request");
async function test() {
  const query = gql`
    query {
      ticket_projects(order_by: { updated_on: desc }, limit: 2) {
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
  try {
    // We can use the hasuraRequest from the backend.
    // Wait, scratch.js doesn't have the admin secret.
    // Let's use ts-node to run a script within the Next.js environment!
  } catch (e) {
    console.log(e);
  }
}
test();
