

const QUERY = `
  query {
    __type(name: "event_attendees") {
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
  const res = await fetch("https://open-languages.hasura.app/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": "tbK6HLeobyLxHpgiwuMNUlKNSl4r7yrF3XOnSYWza9ocZQ57NKghx5xFFq7YNn9e",
    },
    body: JSON.stringify({ query: QUERY }),
  });
  const data = await res.json();
  console.log(data.data.__type.fields.map(f => `${f.name}: ${f.type.name || f.type.kind}`));
}

main().catch(console.error);
