import { config } from "dotenv";
config();

async function run() {
  const query = `
    query {
      __schema {
        types {
          name
        }
      }
    }
  `;

  const res = await fetch(process.env.HASURA_ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  const tables = data.data.__schema.types
    .filter(t => !t.name.startsWith('__'))
    .map(t => t.name)
    .filter(name => !name.includes('_aggregate') && !name.includes('_mutation') && !name.includes('_bool_exp') && !name.includes('_min') && !name.includes('_max') && !name.includes('_stddev') && !name.includes('_var') && !name.includes('_avg') && !name.includes('_sum') && !name.includes('_inc') && !name.includes('_set') && !name.includes('_append') && !name.includes('_prepend') && !name.includes('_delete') && !name.includes('_insert') && !name.includes('_update') && !name.includes('_select') && !name.includes('_stream') && !name.includes('_constraint') && !name.includes('_on_conflict') && !name.includes('_order_by') && !name.includes('_pk_columns_input') && !name.includes('_comparison_exp'));
  
  // Just print the base tables by excluding any name that ends with typical hasura suffixes, or better yet, just print all of them without console.log truncation.
  tables.sort().forEach(t => console.log(t));
}
run();
