import { hasuraRequest } from "./src/api/hasura";
async function run() {
  const orgQuery = `query { organizers { id name } }`;
  const data = await hasuraRequest<any>(orgQuery, {});
  console.log(data);
}
run();
