import { config } from "dotenv";
config();

async function run() {
  const trackRes = await fetch(process.env.HASURA_ADMIN_API.replace("/graphql", "/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "bulk",
      args: [
        {
          type: "pg_create_array_relationship",
          args: {
            table: "sponsored_vouchers",
            name: "voucher_transactions",
            using: {
              foreign_key_constraint_on: {
                table: "voucher_transactions",
                column: "voucher_id",
              },
            },
          },
        },
      ],
    }),
  });
  console.log(await trackRes.json());
}
run();
