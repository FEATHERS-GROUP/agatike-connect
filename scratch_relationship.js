import { config } from "dotenv";
config();

async function run() {
  const query = {
    type: "bulk",
    args: [
      {
        type: "pg_create_array_relationship",
        args: {
          table: "venue_projects",
          name: "venue_project_sections",
          using: {
            foreign_key_constraint_on: {
              table: "venue_project_sections",
              column: "venue_project_id"
            }
          }
        }
      }
    ]
  };

  const res = await fetch(process.env.HASURA_ADMIN_API.replace('/v1/graphql', '/v1/metadata'), {
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
run();
