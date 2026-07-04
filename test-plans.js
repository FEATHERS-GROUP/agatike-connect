import { hasuraRequest } from "./src/api/graphql.server.ts";
hasuraRequest("query { pricing_plans { id name } }").then(console.log).catch(console.error);
