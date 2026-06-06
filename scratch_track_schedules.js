import { config } from "dotenv";
config();

async function runMetadata(query) {
  const res = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/query'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(query),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  await runMetadata({
    type: "bulk",
    args: [
      {
        type: "create_object_relationship",
        args: {
          table: "event_schedules",
          name: "event",
          using: {
            foreign_key_constraint_on: "event_id"
          }
        }
      },
      {
        type: "create_array_relationship",
        args: {
          table: "events",
          name: "event_schedules",
          using: {
            foreign_key_constraint_on: {
              table: "event_schedules",
              column: "event_id"
            }
          }
        }
      },
      {
        type: "create_object_relationship",
        args: {
          table: "event_attendees",
          name: "schedule",
          using: {
            foreign_key_constraint_on: "schedule_id"
          }
        }
      },
      {
        type: "create_array_relationship",
        args: {
          table: "event_schedules",
          name: "attendees",
          using: {
            foreign_key_constraint_on: {
              table: "event_attendees",
              column: "schedule_id"
            }
          }
        }
      }
    ]
  });
}

main();
