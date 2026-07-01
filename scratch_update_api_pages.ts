import * as fs from "fs";

const file = "src/api/workspace-pages.ts";
let code = fs.readFileSync(file, "utf8");

const newMutation = `
export const updateWorkspacePageFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = \`
    mutation UpdateWorkspacePageFolder($id: uuid!, $folder_id: uuid) {
      update_workspace_pages_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  \`;
  return hasuraRequest(q, { id, folder_id });
});
`;

code = code.replace("export const deleteWorkspacePage = createServerFn({ method: \"POST\" }).handler(async (ctx) => {", newMutation + "\nexport const deleteWorkspacePage = createServerFn({ method: \"POST\" }).handler(async (ctx) => {");

code = code.replace(`
        id
        slug
`, `
        id
        slug
        folder_id
`);

fs.writeFileSync(file, code);
console.log("Updated workspace-pages.ts");
