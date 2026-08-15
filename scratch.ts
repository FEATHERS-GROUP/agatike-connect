import { getServerConfig } from "./src/lib/config.server.ts";

async function main() {
  const config = getServerConfig();
  console.log("Config loaded");
  const fetchPromise = await fetch(config.hasuraAdminApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": config.hasuraAdminSecret,
    },
    body: JSON.stringify({
      query: `
        query {
          product_orders(limit: 5, order_by: { created_at: desc }) {
            id
            picked
            status
          }
        }
      `,
    }),
  });
  
  const json = await fetchPromise.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch(console.error);
