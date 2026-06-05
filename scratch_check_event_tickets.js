const fetch = require('node-fetch');

const QUERY = `
  query {
    __type(name: "event_tickets") {
      name
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
`;

async function main() {
  const res = await fetch("https://agatike-hasura.up.railway.app/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": "d2e67df1076b170d6eb3b8117db34e2c"
    },
    body: JSON.stringify({ query: QUERY })
  });
  const data = await res.json();
  console.log(JSON.stringify(data.data.__type.fields.map(f => f.name), null, 2));
}

main().catch(console.error);
