import fs from "fs";
const envPath = ".env";
let content = "";
if (fs.existsSync(envPath)) {
  content = fs.readFileSync(envPath, "utf-8");
}
if (!content.includes("VITE_OMDB_API_KEY")) {
  fs.appendFileSync(envPath, "\nVITE_OMDB_API_KEY=24b0877f\n");
  console.log("Appended VITE_OMDB_API_KEY to .env");
} else {
  console.log("VITE_OMDB_API_KEY already exists in .env");
}
