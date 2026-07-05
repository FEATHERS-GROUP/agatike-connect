import { hasuraRequest } from "../src/api/graphql.server";

async function testQuery() {
  const query = `
    query GetAllPlatformTransactions {
      organizer_invoices(order_by: {created_at: desc}, limit: 5) {
        id
        amount
        status
        created_at
        organizer_id
        subscription_id
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

testQuery();
