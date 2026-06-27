import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS pricing_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    currency text DEFAULT 'USD',
    billing_cycle text DEFAULT 'monthly',
    features jsonb DEFAULT '[]',
    modules_included jsonb DEFAULT '[]',
    is_popular boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id text,
    workspace_id uuid,
    plan_id uuid REFERENCES pricing_plans(id),
    status text NOT NULL DEFAULT 'active',
    start_date timestamp with time zone DEFAULT now(),
    next_billing_date timestamp with time zone,
    amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id text,
    workspace_id uuid,
    subscription_id uuid REFERENCES subscriptions(id),
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
  );

  -- Insert default plans if pricing_plans is empty
  INSERT INTO pricing_plans (id, name, description, price, currency, billing_cycle, features, modules_included, is_popular)
  SELECT 
    gen_random_uuid(), 'Basic', 'Essential tools for small organizers.', 0, 'USD', 'monthly', '["1 Workspace", "Basic Analytics", "Standard Support"]'::jsonb, '["events", "tickets"]'::jsonb, false
  WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE name = 'Basic');

  INSERT INTO pricing_plans (id, name, description, price, currency, billing_cycle, features, modules_included, is_popular)
  SELECT 
    gen_random_uuid(), 'Pro Organizer', 'Advanced tools and branded experiences.', 49.99, 'USD', 'monthly', '["Unlimited Workspaces", "Branded Pages", "Advanced Analytics", "Priority Support", "Custom Ticket Designer"]'::jsonb, '["events", "tickets", "scanner", "analytics", "ticket_designer"]'::jsonb, true
  WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE name = 'Pro Organizer');

  INSERT INTO pricing_plans (id, name, description, price, currency, billing_cycle, features, modules_included, is_popular)
  SELECT 
    gen_random_uuid(), 'Enterprise', 'Custom solutions for large scale operations.', 199.99, 'USD', 'monthly', '["Dedicated Account Manager", "White-label Solution", "API Access", "Custom Integrations"]'::jsonb, '["ALL"]'::jsonb, false
  WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE name = 'Enterprise');
`;

async function run() {
  console.log("Running SQL to create billing tables...");
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: createTablesSQL,
      },
    }),
  });

  const json = await res.json();
  if (json.error) {
    console.error("Error creating tables:", json.error);
  } else {
    console.log("Success! Tables created and default plans seeded.");
  }
}
run();
