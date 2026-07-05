import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getWorkspaceActivePlanFees } from "./billing";

const LOG_SIMULATION = `
  mutation LogSimulation(
    $transaction_id: String!,
    $input_snapshot: jsonb!,
    $expected_collection_cost: numeric!,
    $expected_disbursement_cost: numeric!,
    $expected_margin: numeric!,
    $decision: String!,
    $guaranteed_revenue: numeric,
    $optional_revenue: numeric,
    $provider_cost: numeric,
    $subsidy_amount: numeric,
    $max_allowed_subsidy: numeric,
    $lifecycle_mode: String
  ) {
    insert_fee_simulations_one(object: {
      transaction_id: $transaction_id,
      input_snapshot: $input_snapshot,
      expected_collection_cost: $expected_collection_cost,
      expected_disbursement_cost: $expected_disbursement_cost,
      expected_margin: $expected_margin,
      decision: $decision,
      guaranteed_revenue: $guaranteed_revenue,
      optional_revenue: $optional_revenue,
      provider_cost: $provider_cost,
      subsidy_amount: $subsidy_amount,
      max_allowed_subsidy: $max_allowed_subsidy,
      lifecycle_mode: $lifecycle_mode
    }) {
      transaction_id
    }
  }
`;

export const simulateTransaction = createServerFn({ method: "POST" })
  .validator(
    (d: {
      basePrice: number;
      workspaceId: string;
      network: string;
      countryCode: string;
      transactionId: string;
    }) => d,
  )
  .handler(async (ctx) => {
    const { basePrice, workspaceId, network, countryCode, transactionId } = ctx.data;

    try {
      // Combine workspace and payment provider fees into a single query
      const combinedRes = await hasuraRequest<any>(
        `
        query GetSimulationContext($workspaceId: uuid!, $network: String!, $countryCode: String) {
          workspaces_by_pk(id: $workspaceId) {
            orgnizer_id
          }
          payment_provider_fees(where: {
            _and: [
              { network: { _eq: $network } },
              { country_code: { _eq: $countryCode } }
            ]
          }, limit: 1) {
            collection_percentage
            collection_fixed_fee
            disbursement_percentage
            disbursement_fixed_fee
            is_tiered
            tiered_rules
          }
        }
      `,
        { workspaceId, network, countryCode: countryCode || "RWA" },
      );

      const organizerId = combinedRes.workspaces_by_pk?.orgnizer_id;
      const providerFees = combinedRes.payment_provider_fees?.[0];

      // Fetch pricing plan (subscription rules)
      const planFees = await getWorkspaceActivePlanFees({
        data: { organizer_id: organizerId },
      } as any);

      const customerCollectionPct = planFees.customer_collection_fee_percentage ?? 0;
      const customerCollectionFixed = planFees.customer_collection_fee_fixed ?? 0;
      const customerServicePct = planFees.customer_service_fee_percentage ?? 0;

      const organizerCollectionPct = planFees.organizer_collection_fee_percentage ?? 0;
      const organizerCollectionFixed = planFees.organizer_collection_fee_fixed ?? 0;
      const organizerPlatformContributionPct = planFees.organizer_platform_contribution ?? 0;

      // --- CORE SYSTEM EQUATION & COST HIERARCHY ---
      // 1. Customer Fee Engine
      const customerFee =
        basePrice * (customerCollectionPct / 100) +
        customerCollectionFixed +
        basePrice * (customerServicePct / 100);
      const totalCustomerCharge = basePrice + customerFee;

      // 2. Organizer Pricing Engine
      const organizerFee =
        basePrice * (organizerCollectionPct / 100) +
        organizerCollectionFixed +
        basePrice * (organizerPlatformContributionPct / 100);

      // 3. Platform Margin Buffer
      const platformBufferPct = planFees.platform_margin_buffer || 0; // Explicitly defined, not ad-hoc
      const platformBuffer = (basePrice * platformBufferPct) / 100;

      const totalRevenue = customerFee + organizerFee;

      // Payment Cost Engine
      let expectedCollectionCost = 0;
      let expectedDisbursementCost = 0;

      if (providerFees) {
        let pawaPayCollectionPct = providerFees.collection_percentage || 0;
        let colFixed = providerFees.collection_fixed_fee || 0;
        let pawaPayDisbursementPct = providerFees.disbursement_percentage || 0;
        let disbFixed = providerFees.disbursement_fixed_fee || 0;

        if (providerFees.is_tiered && providerFees.tiered_rules) {
          const rules =
            typeof providerFees.tiered_rules === "string"
              ? JSON.parse(providerFees.tiered_rules)
              : providerFees.tiered_rules;

          if (rules.collection && Array.isArray(rules.collection)) {
            const matchedRule =
              rules.collection.find((r: any) => totalCustomerCharge <= r.max) ||
              rules.collection[rules.collection.length - 1];
            if (matchedRule) {
              pawaPayCollectionPct = matchedRule.pct || 0;
              colFixed = matchedRule.fixed || 0;
            }
          }

          if (rules.disbursement && Array.isArray(rules.disbursement)) {
            const matchedRule =
              rules.disbursement.find((r: any) => basePrice <= r.max) ||
              rules.disbursement[rules.disbursement.length - 1];
            if (matchedRule) {
              pawaPayDisbursementPct = matchedRule.pct || 0;
              disbFixed = matchedRule.fixed || 0;
            }
          }
        }

        expectedCollectionCost = totalCustomerCharge * (pawaPayCollectionPct / 100) + colFixed;

        expectedDisbursementCost = basePrice * (pawaPayDisbursementPct / 100) + disbFixed;
      }

      // --- NEW: LIFECYCLE PROFITABILITY ENGINE ---
      const providerCost = expectedCollectionCost;
      // The organizer and the customer share the collection fee, so both are used to cover the cost
      const guaranteedRevenue = organizerFee + customerFee;
      const optionalRevenue = 0; // Everything is used for the baseline survival check

      const totalCost = providerCost;
      const shortfall = Math.max(0, providerCost - guaranteedRevenue);
      const isSubsidized = shortfall > 0;

      // Option B + A hybrid
      const planMaxSubsidyPct = planFees.max_collection_subsidy_percentage ?? 1.0;
      const withdrawalFeePct = planFees.withdrawal_fee_percentage ?? 0;
      const isSubsidyEnabled = planFees.enable_subsidized_collection !== false;

      const finalSubsidyPct = Math.min(planMaxSubsidyPct, withdrawalFeePct * 0.7);
      const maxAllowedSubsidy = isSubsidyEnabled ? basePrice * (finalSubsidyPct / 100) : 0;

      let decision = "approved";
      let structuredError = null;
      let failureClassification = "OK";

      const expectedMargin = guaranteedRevenue + optionalRevenue - providerCost;

      if (isSubsidized && shortfall > maxAllowedSubsidy) {
        decision = "blocked";
        failureClassification = "UNPROFITABLE";
        structuredError = {
          title: "Payment Network Unavailable",
          description: "This payment method is not available for this transaction amount.",
          details: {
            customerServiceFee: customerFee,
            organizerContribution: organizerFee,
            totalCost: totalCost,
            message:
              "Transaction would result in a negative profit that exceeds the allowed subsidy threshold.",
            shortfall: shortfall,
          },
        };
      } else if (isSubsidized) {
        failureClassification = "SUBSIDIZED_COLLECTION";
      } else if (expectedMargin < platformBuffer) {
        // C. MARGIN WARNING
        failureClassification = "MARGIN_WARNING";
      }

      // Store ledger transaction (fee_simulations)
      await hasuraRequest(LOG_SIMULATION, {
        transaction_id: transactionId,
        input_snapshot: {
          basePrice,
          totalCustomerCharge,
          serviceFee: customerFee,
          organizerId,
          network,
          countryCode,
          customerServicePct: customerCollectionPct,
          organizerContributionPct: organizerCollectionPct,
          providerFees,
        },
        expected_collection_cost: expectedCollectionCost,
        expected_disbursement_cost: expectedDisbursementCost,
        expected_margin: expectedMargin,
        decision,
        guaranteed_revenue: guaranteedRevenue,
        optional_revenue: optionalRevenue,
        provider_cost: providerCost,
        subsidy_amount: isSubsidized ? shortfall : 0,
        max_allowed_subsidy: maxAllowedSubsidy,
        lifecycle_mode: isSubsidized ? "collection_subsidy_enabled" : "profitable",
      });

      return {
        decision,
        failureClassification,
        serviceFee: customerFee,
        organizerFee: organizerFee,
        totalCustomerCharge,
        expectedMargin,
        shortfall: isSubsidized ? shortfall : 0,
        structuredError,
        transactionId,
      };
    } catch (e) {
      console.error("Simulation Engine Failed:", e);
      // Fail-safe block if engine crashes
      return {
        decision: "blocked",
        serviceFee: 0,
        totalCustomerCharge: basePrice,
        expectedMargin: 0,
        shortfall: 0,
        structuredError: {
          title: "❌ Simulation Error",
          description: "Simulation engine encountered an error.",
        },
        transactionId,
      };
    }
  });
