import fetch from "node-fetch";

const endpoint = "https://open-languages.hasura.app/v1/graphql";
const secret = "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e";

async function run() {
  const wsRes = await fetch(endpoint, {
    method: "POST",
    headers: { "x-hasura-admin-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: 'query { workspaces(where: {slug: {_eq: "planet-events"}}) { id } }',
    }),
  });
  const wsData = await wsRes.json();
  const wsId = wsData.data.workspaces[0].id;

  const bookRes = await fetch(endpoint, {
    method: "POST",
    headers: { "x-hasura-admin-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query { agatike_books(where: {workspace_id: {_eq: "${wsId}"}, name: {_eq: "__finance_requests"}}) { id } }`,
    }),
  });
  const bookData = await bookRes.json();

  if (!bookData.data.agatike_books.length) {
    console.log("Book not found");
    return;
  }
  const bookId = bookData.data.agatike_books[0].id;

  const recordData = {
    Type: "Damage Report",
    Title: "Broken Stage Lights",
    Amount: 1500,
    "Requested By": "Alex (Tech Team)",
    Details: "3 main stage lights were damaged during takedown. Need immediate replacement.",
    Status: "Pending",
    LineItems: [
      { Item: "Stage Light Rig", Cost: 1000, Qty: 1 },
      { Item: "Cables", Cost: 250, Qty: 2 },
    ],
  };

  const insertRes = await fetch(endpoint, {
    method: "POST",
    headers: { "x-hasura-admin-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation CreateRecord($object: agatike_book_records_insert_input!) {
        insert_agatike_book_records_one(object: $object) { id }
      }`,
      variables: {
        object: {
          book_id: bookId,
          record_data: recordData,
        },
      },
    }),
  });
  const insertData = await insertRes.json();
  console.log("Inserted:", insertData);
}

run();
