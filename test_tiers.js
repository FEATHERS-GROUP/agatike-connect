const { execSync } = require("child_process");
const query = `
  query {
    cinema_ticket_tiers(limit: 1) {
      id
    }
  }
`;
const fs = require("fs");
const env = fs.readFileSync(".env", "utf-8").split("\n");
const hasuraUrl =
  env.find((l) => l.startsWith("VITE_HASURA_URL"))?.split("=")[1] ||
  "http://localhost:8080/v1/graphql";
const hasuraKey =
  env.find((l) => l.startsWith("VITE_HASURA_ADMIN_SECRET"))?.split("=")[1] || "myadminsecretkey";

try {
  const result = execSync(
    `curl -s -X POST -H "Content-Type: application/json" -H "x-hasura-admin-secret: ${hasuraKey}" -d '{"query": "${query.replace(/\n/g, " ")}"}' ${hasuraUrl}`,
  );
  console.log(result.toString());
} catch (e) {
  console.error(e);
}
