import { hasuraRequest } from "./graphql.server";

async function run() {
  const q = `
    query {
      __type(name: "wallets") {
        fields {
          name
        }
      }
    }
  `;
  const res = await hasuraRequest(q);
  console.log(JSON.stringify(res, null, 2));
}

run().catch(console.error);
