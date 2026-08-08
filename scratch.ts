import { hasuraRequest } from "./src/api/graphql.server";

async function run() {
  const query = `
    query GetFees {
      payment_provider_fees(where: { network: { _eq: "MTN_MOMO_RWA" } }) {
        network
        country_code
        collection_percentage
        collection_fixed_fee
        is_tiered
        tiered_rules
      }
    }
  `;
  try {
    const data = await hasuraRequest(query);
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
