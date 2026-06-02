import { config } from "dotenv";
config();

async function run() {
  const query = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          fields {
            name
          }
        }
      }
    }
  `;

  const response = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  const types = json.data.__schema.types;
  const pageType = types.find(t => t.name.includes("page"));
  console.log("Page Type Found:", pageType?.name);
  if (pageType && pageType.fields) {
    console.log("Fields:", pageType.fields.map(f => f.name));
  } else {
    console.log("Looking for workspace_pages specifically...");
    const wp = types.find(t => t.name === "workspace_pages");
    if (wp) {
      console.log("Found workspace_pages");
    } else {
      console.log("Not found.");
    }
  }
}

run();
