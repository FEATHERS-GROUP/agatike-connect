import { hasuraRequest } from "./src/api/hasura";
async function run() {
  const q = `query { workspace_users(where: { email: { _ilike: "%colleague%" } }) { id email workspaces } }`;
  const res = await hasuraRequest(q, {});
  console.log(res);
}
run();
