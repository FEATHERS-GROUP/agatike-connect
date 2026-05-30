import { hasuraRequest } from "./graphql.server";

const CREATE_EVENT = `
  mutation CreateEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      id
    }
  }
`;

export async function createEvent(eventData: any) {
  return hasuraRequest(CREATE_EVENT, { object: eventData });
}
