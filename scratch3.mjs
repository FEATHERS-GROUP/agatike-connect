import { hasuraRequest } from "./src/api/graphql.server.ts";
async function run() {
  const query = `
    query {
      workspace_pages(limit: 5) {
        slug
        theme_color
        workspace {
          brand_color
        }
      }
    }
  `;
  try {
     const res = await hasuraRequest(query, {});
     console.log(JSON.stringify(res, null, 2));
  } catch(e) {
     console.log(e);
  }
}
run();
