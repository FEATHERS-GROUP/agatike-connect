import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  // Test 1: check if user_id is truly nullable by trying to insert with explicit null
  const mutation = `
    mutation TestInsert($object: event_feedback_insert_input!) {
      insert_event_feedback_one(object: $object) {
        id
        user_id
      }
    }
  `;

  // First get a real event_id to test with
  const eventsQuery = `query { events(limit: 1) { id } }`;
  try {
    const eventsData = await hasuraRequest<{ events: any[] }>(eventsQuery, {});
    const eventId = eventsData.events?.[0]?.id;
    if (!eventId) {
      console.log("No events found");
      return;
    }

    console.log("Testing insert with user_id: null ...");
    const result = await hasuraRequest(mutation, {
      object: {
        event_id: eventId,
        reviewer_name: "Test User",
        reviewer_email: "test@example.com",
        rating: 5,
        source: "web",
        is_verified: false,
        is_featured: false,
        is_public: true,
        tags: "[]",
        media_urls: "[]",
        // user_id intentionally omitted
      },
    });
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error("FAILED:", e.message);
  }
}
run();
