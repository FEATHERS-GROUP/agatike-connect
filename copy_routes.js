const fs = require("fs");
const path = require("path");

const srcDir = "src/routes/dashboard/$workspaceSlug/events/$eventId";
const destDir = "src/routes/dashboard/$workspaceSlug/experiences/$experienceId";

const filesToCopy = [
  "attendees.tsx",
  "planning.tsx",
  "staff.tsx",
  "products&add-ons.tsx",
  "experience.tsx",
];

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

filesToCopy.forEach((file) => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, "utf8");

    // Replace Route definition
    // Usually: createFileRoute("/dashboard/$workspaceSlug/events/$eventId/...")
    content = content.replace(
      /createFileRoute\((['"])\/dashboard\/\$workspaceSlug\/events\/\$eventId/g,
      "createFileRoute($1/dashboard/$workspaceSlug/experiences/$experienceId",
    );

    // Let's also replace any useLoaderData/useParams if needed, but tanstack/router
    // imports might just work if we keep the same param names.
    // Notice the parameter is $experienceId now, so if the code uses `eventId`, we might need to adjust.
    // E.g. const { eventId } = Route.useParams() -> const { experienceId } = Route.useParams()
    // and passing eventId: experienceId to API calls.

    fs.writeFileSync(destPath, content, "utf8");
    console.log(`Copied and modified ${file}`);
  } else {
    console.log(`File not found: ${srcPath}`);
  }
});
