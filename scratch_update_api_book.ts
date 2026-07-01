import * as fs from "fs";

const file = "src/api/book.ts";
let code = fs.readFileSync(file, "utf8");

const newMutation = `
const UPDATE_BOOK_FOLDER = \`
  mutation UpdateBookFolder($id: uuid!, $folder_id: uuid) {
    update_agatike_books_by_pk(pk_columns: { id: $id }, _set: { folder_id: $folder_id }) {
      id
    }
  }
\`;

export const updateBookFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const res = await hasuraRequest<{ update_agatike_books_by_pk: { id: string } }>(UPDATE_BOOK_FOLDER, {
    id, folder_id
  });
  return res.update_agatike_books_by_pk;
});
`;

code = code.replace(
  'export const getWorkspaceBooks = createServerFn({ method: "POST" }).handler(async (ctx) => {',
  newMutation +
    '\nexport const getWorkspaceBooks = createServerFn({ method: "POST" }).handler(async (ctx) => {',
);

code = code.replace(
  `
      id
      name
`,
  `
      id
      name
      folder_id
`,
);

fs.writeFileSync(file, code);
console.log("Updated book.ts");
