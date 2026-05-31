import { hasuraRequest } from "./src/api/graphql.server.js";

async function check() {
  try {
    const res = await hasuraRequest(`
      query CheckForms {
        custom_forms(limit: 1) {
          id
        }
      }
    `);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

check();
