import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_EVENT = `
  mutation CreateEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      id
    }
  }
`;

export const createEvent = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const eventData = ctx.data as any;
    return hasuraRequest(CREATE_EVENT, { object: eventData });
  });
