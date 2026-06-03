import { config } from "dotenv";
config();

async function run() {
  // 2. Track Tables and array relationships
  console.log("Tracking Relationships...");
  const trackRes = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/metadata'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "bulk",
      args: [
        { type: "pg_create_array_relationship", args: { table: "sponsored_voucher_batches", name: "vouchers", using: { foreign_key_constraint_on: { table: "sponsored_vouchers", column: "batch_id" } } } },
        { type: "pg_create_object_relationship", args: { table: "sponsored_vouchers", name: "batch", using: { foreign_key_constraint_on: "batch_id" } } }
      ]
    }),
  });
  console.log(await trackRes.json());
}
run();
