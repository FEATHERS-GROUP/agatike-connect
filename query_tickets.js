import dotenv from 'dotenv';
dotenv.config();

fetch(process.env.HASURA_ADMIN_API, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRETE
  },
  body: JSON.stringify({
    query: `
      query {
        event_tickets(limit: 5, order_by: {created_at: desc}) {
          id
          type
          cost
          name
        }
      }
    `
  })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
