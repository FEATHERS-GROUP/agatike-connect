import { hasuraRequest } from "../src/api/graphql.server.ts";
import * as dotenv from "dotenv";
dotenv.config();

async function migrate() {
  console.log("Fetching all products...");
  const query = `
    query {
      products {
        id
        name
        available_sizes
        available_colors
      }
    }
  `;

  try {
    const res = await hasuraRequest(query, {});
    const products = res?.products;

    if (!products) {
      console.log("No products found.");
      return;
    }

    console.log(`Found ${products.length} products. Migrating...`);

    let count = 0;
    for (const product of products) {
      let sizes = Array.isArray(product.available_sizes)
        ? product.available_sizes.map((s: any) =>
            typeof s === "string" ? { name: s, stock: 0 } : s,
          )
        : [];
      const colors = Array.isArray(product.available_colors)
        ? product.available_colors.map((c: any) =>
            typeof c === "string" ? { name: c, stock: 0 } : c,
          )
        : [];

      if (sizes.length === 0 && colors.length > 0) {
        // Create "One Size" and nest colors inside
        sizes = [
          {
            name: "One Size",
            stock: colors.reduce((acc: number, c: any) => acc + (c.stock || 0), 0),
            colors: colors,
          },
        ];
      } else if (sizes.length > 0 && colors.length > 0) {
        // Nest all colors inside the FIRST size (simplest migration path)
        sizes[0].colors = colors;
      }

      // If sizes is still empty and colors is empty, sizes = null
      const finalSizes = sizes.length > 0 ? sizes : null;

      const updateQuery = `
        mutation UpdateProduct($id: uuid!, $available_sizes: jsonb) {
          update_products_by_pk(
            pk_columns: { id: $id },
            _set: {
              available_sizes: $available_sizes,
              available_colors: null
            }
          ) {
            id
          }
        }
      `;

      await hasuraRequest(updateQuery, {
        id: product.id,
        available_sizes: finalSizes,
      });

      console.log(`Migrated product ${product.id} (${product.name})`);
      count++;
    }

    console.log(`Successfully migrated ${count} products.`);

    // Attempt to drop the column via run_sql API
    console.log("Attempting to drop available_colors column...");
    try {
      const dropRes = await fetch(
        process.env.VITE_HASURA_GRAPHQL_ENDPOINT.replace("/v1/graphql", "/v2/query"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
          },
          body: JSON.stringify({
            type: "run_sql",
            args: {
              sql: "ALTER TABLE products DROP COLUMN IF EXISTS available_colors CASCADE;",
              cascade: true,
            },
          }),
        },
      );
      const dropData = await dropRes.json();
      console.log("Drop column response:", dropData);

      // Also untrack it from Hasura
      await fetch(process.env.VITE_HASURA_GRAPHQL_ENDPOINT.replace("/v1/graphql", "/v1/metadata"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({
          type: "pg_reload_metadata",
          args: {
            reload_remote_schemas: true,
          },
        }),
      });
      console.log("Reloaded Hasura metadata.");
    } catch (sqlErr) {
      console.error(
        "Could not drop column programmatically. You may need to remove it from the Hasura Console manually.",
        sqlErr.message,
      );
    }
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
