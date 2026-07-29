import { hasuraRequest } from "./graphql.server";

async function run() {
  const q = `
    query {
      __schema {
        types {
          name
        }
      }
    }
  `;
  const res = await hasuraRequest(q);
  const tables = res.__schema.types
    .map((t: any) => t.name)
    .filter((n: string) => !n.startsWith("__") && !n.endsWith("_aggregate") && !n.endsWith("_mutation_response") && !n.endsWith("_bool_exp") && !n.endsWith("_order_by") && !n.endsWith("_select_column") && !n.endsWith("_set_input") && !n.endsWith("_inc_input") && !n.endsWith("_update_column") && !n.endsWith("_insert_input") && !n.endsWith("_obj_rel_insert_input") && !n.endsWith("_arr_rel_insert_input") && !n.endsWith("_on_conflict") && !n.endsWith("_constraint"));
  console.log(JSON.stringify(tables, null, 2));
}

run().catch(console.error);
