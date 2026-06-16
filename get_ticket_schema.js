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
        __type(name: "event_tickets") {
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    `
  })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
