import { hasuraRequest } from './src/api/graphql.server.js';

async function run() {
  const query = `
    query {
      wallet_transactions(order_by: { created_at: desc }, limit: 5) {
        id
        status
        provider_status
        provider_reference
        created_at
      }
    }
  `;
  try {
    const data = await hasuraRequest(query);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
