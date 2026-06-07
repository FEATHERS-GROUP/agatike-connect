import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      __type(name: "venue_projects") {
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

  const res = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  const fields = data.data.__type.fields.map(f => {
    let typeName = f.type.name;
    if (f.type.kind === 'NON_NULL') {
      typeName = f.type.ofType.name + '!';
    }
    return `${f.name}: ${typeName}`;
  });
  console.log(fields.join('\n'));
}
run();
