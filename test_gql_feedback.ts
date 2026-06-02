import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  const query = `
    query {
      __type(name: "event_feedback") {
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
  try {
    const res = await hasuraRequest(query, {});
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
