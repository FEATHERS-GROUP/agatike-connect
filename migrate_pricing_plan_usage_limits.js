import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function runSQL(sql, label) {
  console.log(`\n▶ ${label}...`);
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { source: "default", sql },
    }),
  });
  const json = await res.json();
  if (json.error || json.code) {
    console.error(`  ✗ Error:`, json.error || json.message || JSON.stringify(json));
  } else {
    console.log(`  ✓ Done`);
    if (json.result) {
      // Print column listing
      json.result.slice(1).forEach(row => console.log("   ", row.join(" | ")));
    }
  }
  return json;
}

async function run() {
  console.log("=== pricing_plans Schema Migration ===\n");

  // 1. Show current columns
  await runSQL(
    `SELECT column_name, data_type, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'pricing_plans'
     ORDER BY ordinal_position;`,
    "Current pricing_plans columns"
  );

  // 2. Add all columns that may be missing (using IF NOT EXISTS via DO block)
  const addColumnsMigration = `
    DO $$
    BEGIN
      -- usage_limits: stores all structured limits as jsonb
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='usage_limits') THEN
        ALTER TABLE pricing_plans ADD COLUMN usage_limits jsonb DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added usage_limits column';
      ELSE
        RAISE NOTICE 'usage_limits already exists';
      END IF;

      -- yearly_price
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='yearly_price') THEN
        ALTER TABLE pricing_plans ADD COLUMN yearly_price numeric;
        RAISE NOTICE 'Added yearly_price column';
      END IF;

      -- active
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='active') THEN
        ALTER TABLE pricing_plans ADD COLUMN active boolean DEFAULT true;
        RAISE NOTICE 'Added active column';
      END IF;

      -- customer_service_fee_percentage
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='customer_service_fee_percentage') THEN
        ALTER TABLE pricing_plans ADD COLUMN customer_service_fee_percentage numeric DEFAULT 0;
        RAISE NOTICE 'Added customer_service_fee_percentage column';
      END IF;

      -- organizer_platform_contribution
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='organizer_platform_contribution') THEN
        ALTER TABLE pricing_plans ADD COLUMN organizer_platform_contribution numeric DEFAULT 2;
        RAISE NOTICE 'Added organizer_platform_contribution column';
      END IF;

      -- platform_margin_buffer
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='platform_margin_buffer') THEN
        ALTER TABLE pricing_plans ADD COLUMN platform_margin_buffer numeric DEFAULT 0;
        RAISE NOTICE 'Added platform_margin_buffer column';
      END IF;

      -- max_withdrawals_per_week
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='max_withdrawals_per_week') THEN
        ALTER TABLE pricing_plans ADD COLUMN max_withdrawals_per_week text DEFAULT 'unlimited';
        RAISE NOTICE 'Added max_withdrawals_per_week column';
      END IF;

      -- customer_collection_fee_percentage
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='customer_collection_fee_percentage') THEN
        ALTER TABLE pricing_plans ADD COLUMN customer_collection_fee_percentage numeric;
        RAISE NOTICE 'Added customer_collection_fee_percentage column';
      END IF;

      -- customer_collection_fee_fixed
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='customer_collection_fee_fixed') THEN
        ALTER TABLE pricing_plans ADD COLUMN customer_collection_fee_fixed numeric;
        RAISE NOTICE 'Added customer_collection_fee_fixed column';
      END IF;

      -- organizer_collection_fee_percentage
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='organizer_collection_fee_percentage') THEN
        ALTER TABLE pricing_plans ADD COLUMN organizer_collection_fee_percentage numeric;
        RAISE NOTICE 'Added organizer_collection_fee_percentage column';
      END IF;

      -- organizer_collection_fee_fixed
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='organizer_collection_fee_fixed') THEN
        ALTER TABLE pricing_plans ADD COLUMN organizer_collection_fee_fixed numeric;
        RAISE NOTICE 'Added organizer_collection_fee_fixed column';
      END IF;

      -- withdrawal_fee_percentage
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='withdrawal_fee_percentage') THEN
        ALTER TABLE pricing_plans ADD COLUMN withdrawal_fee_percentage numeric;
        RAISE NOTICE 'Added withdrawal_fee_percentage column';
      END IF;

      -- withdrawal_fee_fixed
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='withdrawal_fee_fixed') THEN
        ALTER TABLE pricing_plans ADD COLUMN withdrawal_fee_fixed numeric;
        RAISE NOTICE 'Added withdrawal_fee_fixed column';
      END IF;

      -- enable_subsidized_collection
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='enable_subsidized_collection') THEN
        ALTER TABLE pricing_plans ADD COLUMN enable_subsidized_collection boolean DEFAULT false;
        RAISE NOTICE 'Added enable_subsidized_collection column';
      END IF;

      -- withdrawal_dependency_required
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='withdrawal_dependency_required') THEN
        ALTER TABLE pricing_plans ADD COLUMN withdrawal_dependency_required boolean DEFAULT false;
        RAISE NOTICE 'Added withdrawal_dependency_required column';
      END IF;

      -- max_collection_subsidy_percentage
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pricing_plans' AND column_name='max_collection_subsidy_percentage') THEN
        ALTER TABLE pricing_plans ADD COLUMN max_collection_subsidy_percentage numeric;
        RAISE NOTICE 'Added max_collection_subsidy_percentage column';
      END IF;
    END
    $$;
  `;

  await runSQL(addColumnsMigration, "Add missing columns to pricing_plans");

  // 3. Seed default usage_limits for existing plans that have NULL or empty usage_limits
  const defaultBasicLimits = JSON.stringify({
    max_workspaces: 1,
    max_events: 5,
    max_cinemas: 0,
    max_cinema_screens: 0,
    max_spaces: 0,
    max_venues: 0,
    max_ticket_designs: 1,
    max_badge_designs: 0,
    max_page_builders: 0,
    max_invoices: 10,
    max_tasks: 10,
    max_custom_forms: 1,
    max_rsvps: 100,
    max_customer_books: 1,
    max_campaigns: 0,
    max_gift_cards: 0,
    max_punch_cards: 0,
    max_event_staff: 1,
    max_event_sections: 1,
    max_event_vendors: 0,
    max_event_vouchers: 0,
    max_event_stories: 0,
    max_event_posts: 0,
    max_ticket_tiers_per_event: 2,
    max_workspace_users: 2,
    max_contributors: 0,
    has_studio_access: false,
    can_invite_contributors: false,
    can_link_modules: false,
    support_type: "standard",
    venue_design_type: "basic"
  });

  const defaultProLimits = JSON.stringify({
    max_workspaces: 3,
    max_events: -1,
    max_cinemas: 2,
    max_cinema_screens: 5,
    max_spaces: 2,
    max_venues: 5,
    max_ticket_designs: 5,
    max_badge_designs: 5,
    max_page_builders: 5,
    max_invoices: -1,
    max_tasks: -1,
    max_custom_forms: 10,
    max_rsvps: -1,
    max_customer_books: 5,
    max_campaigns: 5,
    max_gift_cards: 5,
    max_punch_cards: 5,
    max_event_staff: 10,
    max_event_sections: 5,
    max_event_vendors: 10,
    max_event_vouchers: 100,
    max_event_stories: 10,
    max_event_posts: 10,
    max_ticket_tiers_per_event: 5,
    max_workspace_users: 10,
    max_contributors: 5,
    has_studio_access: true,
    can_invite_contributors: true,
    can_link_modules: true,
    support_type: "priority",
    venue_design_type: "advanced"
  });

  const defaultEnterpriseLimits = JSON.stringify({
    max_workspaces: -1,
    max_events: -1,
    max_experiences: -1,
    max_cinemas: -1,
    max_cinema_screens: -1,
    max_spaces: -1,
    max_venues: -1,
    max_ticket_designs: -1,
    max_badge_designs: -1,
    max_page_builders: -1,
    max_invoices: -1,
    max_tasks: -1,
    max_custom_forms: -1,
    max_rsvps: -1,
    max_customer_books: -1,
    max_campaigns: -1,
    max_gift_cards: -1,
    max_punch_cards: -1,
    max_event_staff: -1,
    max_event_sections: -1,
    max_event_vendors: -1,
    max_event_vouchers: -1,
    max_event_stories: -1,
    max_event_posts: -1,
    max_ticket_tiers_per_event: -1,
    max_workspace_users: -1,
    max_contributors: -1,
    has_studio_access: true,
    can_invite_contributors: true,
    can_link_modules: true,
    support_type: "dedicated",
    venue_design_type: "custom"
  });

  const seedDefaultsSQL = `
    -- Set usage_limits on plans that have NULL or empty {} limits
    UPDATE pricing_plans
    SET usage_limits = '${defaultBasicLimits}'::jsonb
    WHERE (usage_limits IS NULL OR usage_limits = '{}'::jsonb)
      AND LOWER(name) LIKE '%basic%';

    UPDATE pricing_plans
    SET usage_limits = '${defaultProLimits}'::jsonb
    WHERE (usage_limits IS NULL OR usage_limits = '{}'::jsonb)
      AND (LOWER(name) LIKE '%pro%' OR LOWER(name) LIKE '%starter%' OR LOWER(name) LIKE '%growth%');

    UPDATE pricing_plans
    SET usage_limits = '${defaultEnterpriseLimits}'::jsonb
    WHERE (usage_limits IS NULL OR usage_limits = '{}'::jsonb)
      AND (LOWER(name) LIKE '%enterprise%' OR LOWER(name) LIKE '%business%' OR LOWER(name) LIKE '%unlimited%');
  `;

  await runSQL(seedDefaultsSQL, "Seed default usage_limits for existing plans");

  // 4. Show resulting plans and their usage_limits
  await runSQL(
    `SELECT id, name, price, 
      CASE WHEN usage_limits IS NULL THEN 'NULL' 
           WHEN usage_limits = '{}'::jsonb THEN 'EMPTY {}' 
           ELSE 'SET (' || length(usage_limits::text) || ' chars)'
      END AS usage_limits_status
     FROM pricing_plans
     ORDER BY price;`,
    "Verify - pricing_plans usage_limits status"
  );

  console.log("\n✅ Migration complete!\n");
  console.log("Next steps:");
  console.log("  1. Open http://localhost:3000/internal/control/admin/pricing");
  console.log("  2. Click any plan → Edit Plan → navigate to Step 5 (Usage Limits & Rules)");
  console.log("  3. Update the limits and click Save Changes");
  console.log("  4. The values will be stored in the usage_limits jsonb column in the DB.");
  console.log("  5. The useSubscriptionLimits hook reads them from the DB via getActiveSubscription.");
}

run().catch(console.error);
