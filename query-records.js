import fetch from "node-fetch";

const endpoint = "https://open-languages.hasura.app/v1/graphql";
const secret = "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

async function run() {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "x-hasura-admin-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "query { agatike_book_records(limit: 5, order_by: {created_at: desc}) { id record_data book_id } }",
    }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
