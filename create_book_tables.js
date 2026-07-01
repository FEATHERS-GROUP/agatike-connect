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

async function trackTable(tableName) {
  const res = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        schema: "public",
        name: tableName,
      },
    }),
  });
  const json = await res.json();
  if (json.error && !json.error.includes("already tracked")) {
    console.error(`Track Table Error (${tableName}):`, json.error);
  } else {
    console.log(`Tracked table: ${tableName}`);
  }
}

async function createArrayRelationship(table, relName, refTable, mapping) {
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
            columns: [mapping]
          }
        }
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
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS workspace_tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date DATE,
      assigned_to TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspace_notes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      pinned BOOLEAN DEFAULT FALSE,
      tags JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspace_invoices (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      workspace_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL UNIQUE,
      invoice_type TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_company TEXT,
      client_address TEXT,
      issue_date DATE,
      due_date DATE,
      tax_rate NUMERIC,
      notes TEXT,
      payment_terms TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT NOT NULL DEFAULT 'RWF',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspace_invoice_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      invoice_id UUID NOT NULL REFERENCES workspace_invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity NUMERIC NOT NULL,
      unit_price NUMERIC NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    console.log("Running SQL to create tables...");
    await runSQL(sql);
    console.log("Tables created successfully.");

    console.log("Tracking tables in Hasura...");
    await trackTable("workspace_tasks");
    await trackTable("workspace_notes");
    await trackTable("workspace_invoices");
    await trackTable("workspace_invoice_items");

    console.log("Creating relationships...");
    await createArrayRelationship("workspace_invoices", "items", "workspace_invoice_items", "invoice_id");

    console.log("Done!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
