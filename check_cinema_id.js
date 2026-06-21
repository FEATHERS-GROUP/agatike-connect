import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const query = `
    query {
      ticket_projects(limit: 1) {
        id
        cinemaId
      }
    }
  `;

  const res = await fetch(HASURA_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({ query }),
  });
  console.log(await res.json());
}

run();
