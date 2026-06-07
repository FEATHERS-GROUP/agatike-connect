import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      community_channels {
        id
        name
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

  console.log("Channels in Hasura:");
  console.log(JSON.stringify(await res.json(), null, 2));
}

run();
