import * as fs from "fs";

const file = "src/api/rsvps.ts";
let code = fs.readFileSync(file, "utf8");

const newMutation = `
export const updateCustomFormFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = \`
    mutation UpdateCustomFormFolder($id: uuid!, $folder_id: uuid) {
      update_custom_forms_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  \`;
  return hasuraRequest(q, { id, folder_id });
});
`;

code = code.replace("export const deleteCustomForm = createServerFn({ method: \"POST\" }).handler(async (ctx) => {", newMutation + "\nexport const deleteCustomForm = createServerFn({ method: \"POST\" }).handler(async (ctx) => {");

code = code.replace(`
      id
      title
`, `
      id
      title
      folder_id
`);

fs.writeFileSync(file, code);
console.log("Updated rsvps.ts");
