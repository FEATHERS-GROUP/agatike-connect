import * as fs from "fs";

const file = "src/api/cinema_management.ts";
let code = fs.readFileSync(file, "utf8");

const newMutation = `
const UPDATE_MOVIE_FOLDER = \`
  mutation UpdateMovieFolder($id: uuid!, $folder_id: uuid) {
    update_cinema_movies_by_pk(pk_columns: { id: $id }, _set: { folder_id: $folder_id }) {
      id
    }
  }
\`;

export const updateMovieFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const res = await hasuraRequest<{ update_cinema_movies_by_pk: { id: string } }>(UPDATE_MOVIE_FOLDER, {
    id, folder_id
  });
  return res.update_cinema_movies_by_pk;
});
`;

code = code.replace(
  'export const updateMovie = createServerFn({ method: "POST" }).handler(async (ctx) => {',
  newMutation +
    '\nexport const updateMovie = createServerFn({ method: "POST" }).handler(async (ctx) => {',
);

code = code.replace(
  `
      id
      title
`,
  `
      id
      title
      folder_id
`,
);

fs.writeFileSync(file, code);
console.log("Updated cinema_management.ts");
