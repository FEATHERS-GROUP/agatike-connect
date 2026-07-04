import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

const createTablesSQL = `
  -- Support Tickets Table
  CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id uuid NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    category text NOT NULL DEFAULT 'other',
    priority text NOT NULL DEFAULT 'normal',
    status text NOT NULL DEFAULT 'open',
    assigned_to uuid,
    subscription_plan_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
  );

  -- Support Ticket Comments Table
  CREATE TABLE IF NOT EXISTS support_ticket_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_type text NOT NULL,
    author_id uuid NOT NULL,
    author_name text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS support_tickets_organizer_idx ON support_tickets(organizer_id);
  CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
  CREATE INDEX IF NOT EXISTS support_tickets_assigned_idx ON support_tickets(assigned_to);
  CREATE INDEX IF NOT EXISTS support_ticket_comments_ticket_idx ON support_ticket_comments(ticket_id);
`;

const trackSupportTickets = {
  type: "pg_track_table",
  args: {
    source: "default",
    schema: "public",
    name: "support_tickets",
  },
};

const trackSupportTicketComments = {
  type: "pg_track_table",
  args: {
    source: "default",
    schema: "public",
    name: "support_ticket_comments",
  },
};

const createRelationshipCommentsOnTicket = {
  type: "pg_create_array_relationship",
  args: {
    table: { schema: "public", name: "support_tickets" },
    name: "comments",
    using: {
      foreign_key_constraint_on: {
        table: { schema: "public", name: "support_ticket_comments" },
        column: "ticket_id",
      },
    },
  },
};

const createRelationshipTicketOnComment = {
  type: "pg_create_object_relationship",
  args: {
    table: { schema: "public", name: "support_ticket_comments" },
    name: "ticket",
    using: {
      foreign_key_constraint_on: "ticket_id",
    },
  },
};

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
        sql,
      },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

async function metadataRequest(body) {
  const res = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  // Ignore "already tracked" errors — idempotent
  if (json.error && !json.error.includes("already") && !json.error.includes("exists")) {
    console.warn("Metadata warning:", json.error);
  }
  return json;
}

async function run() {
  console.log("=== Creating Support Tables ===");

  console.log("→ Running SQL migrations...");
  await runSQL(createTablesSQL);
  console.log("  ✓ Tables created");

  console.log("→ Tracking support_tickets...");
  await metadataRequest(trackSupportTickets);
  console.log("  ✓ support_tickets tracked");

  console.log("→ Tracking support_ticket_comments...");
  await metadataRequest(trackSupportTicketComments);
  console.log("  ✓ support_ticket_comments tracked");

  console.log("→ Creating relationships...");
  await metadataRequest(createRelationshipCommentsOnTicket);
  await metadataRequest(createRelationshipTicketOnComment);
  console.log("  ✓ Relationships created");

  console.log("\n✅ Support tables setup complete!");
}

run().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
