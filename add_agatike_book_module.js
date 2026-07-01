import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const mutation = `
    mutation InsertAgatikeBook {
      insert_platformModules_one(
        object: {
          label: "Agatike Book",
          category: "SHARED",
          icon: "BookOpen",
          href: "book",
          desc: "Tasks, notes, finance, procurement & custom books for your workspace",
          mandatory: false
        },
        on_conflict: {
          constraint: platformModules_label_key,
          update_columns: [category, icon, href, desc]
        }
      ) {
        id
        label
        category
      }
    }
  `;

  const res = await fetch(`${API_BASE}/v1/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({ query: mutation }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
run();
