import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      organizer_followers {
        id
        organizer_id
        user_id
      }
    }
  `;

  const res = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}

run();
