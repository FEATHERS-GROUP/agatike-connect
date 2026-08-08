import { hasuraRequest } from "../src/api/graphql.server";

async function checkTx() {
  const query = `
    query {
      wallet_transactions(order_by: { created_at: desc }, limit: 1) {
        id
        status
        provider_status
        amount
        net_amount
      }
    }
  `;
  const res = await hasuraRequest(query);
  console.log(JSON.stringify(res, null, 2));
}

checkTx().catch(console.error);
