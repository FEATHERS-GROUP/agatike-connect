import { hasuraRequest } from "./graphql.server";

async function run() {
  const q = `
    query {
      __schema {
        types {
          name
          fields {
            name
            type {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  `;
  const res = await hasuraRequest(q);
  const typesToInspect = [
    "events",
    "event_attendees",
    "event_tickets",
    "product_orders",
    "users",
    "venue_bookings",
    "cinema_ticket_tiers",
    "products",
    "cinemas",
    "cinema_movies",
    "cinema_bookings",
    "event_feedback",
    "custom_forms",
    "rentable_venues",
    "space_subscriptions",
    "workspace_users",
    "wallet_transactions",
    "ledger_transactions",
  ];

  const tables = res.__schema.types
    .filter((t: any) => typesToInspect.includes(t.name))
    .map((t: any) => {
      const scalarFields =
        t.fields
          ?.filter((f: any) => f.type.kind === "SCALAR" || f.type.ofType?.kind === "SCALAR")
          .map((f: any) => f.name) || [];
      const jsonbFields =
        t.fields
          ?.filter((f: any) => f.type.name === "jsonb" || f.type.ofType?.name === "jsonb")
          .map((f: any) => f.name) || [];
      const relFields =
        t.fields
          ?.filter(
            (f: any) =>
              f.type.kind === "OBJECT" ||
              f.type.kind === "LIST" ||
              f.type.ofType?.kind === "OBJECT",
          )
          .map((f: any) => f.name) || [];
      return {
        name: t.name,
        scalarFields,
        jsonbFields,
        relFields,
      };
    });

  console.log(JSON.stringify(tables, null, 2));
}

run().catch(console.error);
