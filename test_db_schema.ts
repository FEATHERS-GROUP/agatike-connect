import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  // Check the column default & nullable status via postgres introspection
  const query = `
    query {
      event_feedback_insert_input: __type(name: "event_feedback_insert_input") {
        inputFields {
          name
          type {
            name
            kind
            ofType { name kind }
          }
        }
      }
    }
  `;
  try {
    const res = await hasuraRequest(query, {});
    const fields = res.event_feedback_insert_input?.inputFields || [];
    const userIdField = fields.find((f: any) => f.name === "user_id");
    const attendeeIdField = fields.find((f: any) => f.name === "attendee_id");
    console.log("user_id field:", JSON.stringify(userIdField, null, 2));
    console.log("attendee_id field:", JSON.stringify(attendeeIdField, null, 2));

    // Also check if there's a trigger by looking at sql
    const triggerQuery = `
      query {
        event_feedback(limit: 1) {
          id
          user_id
          attendee_id
        }
      }
    `;
    const existingData = await hasuraRequest<{ event_feedback: any[] }>(triggerQuery, {});
    console.log("Existing feedback rows:", JSON.stringify(existingData.event_feedback, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
