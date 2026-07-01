import * as fs from "fs";

const file = "src/api/events.ts";
let code = fs.readFileSync(file, "utf8");

const newMutation = `
export const updateTicketProjectFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = \`
    mutation UpdateTicketProjectFolder($id: uuid!, $folder_id: uuid) {
      update_ticket_projects_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  \`;
  return hasuraRequest(q, { id, folder_id });
});

export const deleteTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  const q = \`
    mutation DeleteTicketProject($id: uuid!) {
      update_ticket_projects_by_pk(pk_columns: {id: $id}, _set: {deleted: true}) {
        id
      }
    }
  \`;
  return hasuraRequest(q, { id });
});
`;

code = code.replace(
  'export const updateTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {',
  newMutation +
    '\nexport const updateTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {',
);

code = code.replace(
  `
      cinemaId
`,
  `
      cinemaId
      folder_id
`,
);

fs.writeFileSync(file, code);
console.log("Updated events.ts");
