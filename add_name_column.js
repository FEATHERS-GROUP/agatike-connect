import dotenv from "dotenv";
dotenv.config();

fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query"), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  },
  body: JSON.stringify({
    type: "run_sql",
    args: {
      sql: "ALTER TABLE event_tickets ADD COLUMN name text;",
    },
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
