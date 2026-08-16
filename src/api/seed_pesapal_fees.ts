import dotenv from "dotenv";
dotenv.config();

const url = process.env.HASURA_GRAPHQL_ENDPOINT || "https://open-languages.hasura.app/v1/graphql";
const secret =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET ||
  "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

async function updatePesapal() {
  const mutation = `
    mutation {
      insert_payment_provider_fees(
        objects: {
          network: "AGATIKE_CARD",
          country_code: "RWA",
          collection_percentage: 3.5,
          collection_fixed_fee: 0,
          disbursement_percentage: 0,
          disbursement_fixed_fee: 0,
          is_tiered: false
        }
      ) {
        affected_rows
      }
    }
  `;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": secret,
      },
      body: JSON.stringify({ query: mutation }),
    });
    const data = await res.json();
    console.log(
      `Inserted AGATIKE_CARD:`,
      data.data?.insert_payment_provider_fees?.affected_rows || data.errors,
    );
  } catch (e) {
    console.error(`Failed AGATIKE_CARD`, e);
  }
}

updatePesapal();
