const { execSync } = require("child_process");
const fs = require("fs");

async function check() {
  const code = fs.readFileSync("src/api/hasura.ts", "utf8");
  console.log(code.slice(0, 500));
}
check();
