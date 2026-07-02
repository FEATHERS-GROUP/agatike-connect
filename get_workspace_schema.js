import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;
async function run() {
  const query = `query { __type(name: "workspaces") { fields { name } } }`;
  const res = await fetch(`${API_BASE}/v1/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
run();
