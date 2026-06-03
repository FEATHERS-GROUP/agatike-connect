import { config } from "dotenv";
config();

async function run() {
  const trackRes = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/metadata'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "bulk",
      args: [
        { type: "pg_track_table", args: { schema: "public", name: "voucher_transactions" } }
      ]
    }),
  });
  console.log(await trackRes.json());
}
run();
