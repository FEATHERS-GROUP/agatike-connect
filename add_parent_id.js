import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function runSQL(sql) {
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: sql,
      },
    }),
  });
  const json = await res.json();
  if (json.error) {
    console.error("SQL Error:", json.error);
    throw new Error(json.error);
  }
  return json;
}

async function createObjectRelationship(table, relName, refTable, mappingColumn) {
  const res = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      type: "pg_create_object_relationship",
      args: {
        source: "default",
        table: table,
        name: relName,
        using: {
          foreign_key_constraint_on: mappingColumn,
        },
      },
    }),
  });
  const json = await res.json();
  if (json.error && !json.error.includes("already exists")) {
    console.error(`Object Rel Error (${relName}):`, json.error);
  } else {
    console.log(`Created object relationship: ${relName}`);
  }
}

async function createArrayRelationship(table, relName, refTable, mappingColumn) {
  const res = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      type: "pg_create_array_relationship",
      args: {
        source: "default",
        table: table,
        name: relName,
        using: {
          foreign_key_constraint_on: {
            table: refTable,
            columns: [mappingColumn],
          },
        },
      },
    }),
  });
  const json = await res.json();
  if (json.error && !json.error.includes("already exists")) {
    console.error(`Array Rel Error (${relName}):`, json.error);
  } else {
    console.log(`Created array relationship: ${relName}`);
  }
}

async function run() {
  const sql = `
    ALTER TABLE workspace_pages
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES workspace_pages(id) ON DELETE CASCADE;
  `;

  try {
    console.log("Adding parent_id column...");
    await runSQL(sql);
    console.log("Column added.");

    console.log("Setting up relationships...");
    await createObjectRelationship("workspace_pages", "parent", "workspace_pages", "parent_id");
    await createArrayRelationship("workspace_pages", "children", "workspace_pages", "parent_id");
    
    console.log("Success!");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

run();
