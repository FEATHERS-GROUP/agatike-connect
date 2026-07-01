import * as fs from "fs";

const file = "src/api/badges.ts";
let code = fs.readFileSync(file, "utf8");

const newMutation = `
export const updateBadgeProjectFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = \`
    mutation UpdateBadgeProjectFolder($id: uuid!, $folder_id: uuid) {
      update_badge_projects_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  \`;
  return hasuraRequest(q, { id, folder_id });
});

export const deleteBadgeProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  const q = \`
    mutation DeleteBadgeProject($id: uuid!) {
      delete_badge_projects_by_pk(id: $id) {
        id
      }
    }
  \`;
  return hasuraRequest(q, { id });
});
`;

code = code.replace("export const saveBadgeProject = createServerFn({ method: \"POST\" }).handler(async (ctx) => {", newMutation + "\nexport const saveBadgeProject = createServerFn({ method: \"POST\" }).handler(async (ctx) => {");

code = code.replace(`
      id
      theme
`, `
      id
      theme
      folder_id
`);

fs.writeFileSync(file, code);
console.log("Updated badges.ts");
