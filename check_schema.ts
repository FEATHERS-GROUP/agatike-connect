import { hasuraRequest } from "./src/api/graphql.server.ts";

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __type(name: "subscriptions") {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;

async function run() {
  try {
    const res = await hasuraRequest(INTROSPECTION_QUERY);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
