import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  const query = `
    query Introspection {
      __type(name: "event_feedback_insert_input") {
        inputFields {
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
    const res = await hasuraRequest(query);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
