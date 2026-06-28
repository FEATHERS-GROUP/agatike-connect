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
    $decision: String!
  ) {
    insert_fee_simulations_one(object: {
      transaction_id: $transaction_id,
      input_snapshot: $input_snapshot,
      expected_collection_cost: $expected_collection_cost,
      expected_disbursement_cost: $expected_disbursement_cost,
      expected_margin: $expected_margin,
      decision: $decision
    }) {
      transaction_id
    }
  }
`;

export const simulateTransaction = createServerFn({ method: "POST" })
  .validator((d: { basePrice: number; workspaceId: string; network: string; countryCode: string; transactionId: string }) => d)
  .handler(async (ctx) => {
    const { basePrice, workspaceId, network, countryCode, transactionId } = ctx.data;

    try {
      // Combine workspace and payment provider fees into a single query
      const combinedRes = await hasuraRequest<any>(`
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
      `, { workspaceId, network, countryCode: countryCode || "RWA" });

      const organizerId = combinedRes.workspaces_by_pk?.orgnizer_id;
      const providerFees = combinedRes.payment_provider_fees?.[0];

      // Fetch pricing plan (subscription rules)
      const planFees = await getWorkspaceActivePlanFees({ data: { organizer_id: organizerId } } as any);

      const customerServicePct = planFees.customer_service_fee_percentage || 2.0;
      const organizerContributionPct = planFees.organizer_platform_contribution || 0;

      // --- CORE SYSTEM EQUATION & COST HIERARCHY ---
      // 1. Customer Fee Engine
      const customerFee = (basePrice * customerServicePct) / 100;
      const totalCustomerCharge = basePrice + customerFee;

      // 2. Organizer Pricing Engine
      const organizerFee = (basePrice * organizerContributionPct) / 100;

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
          const rules = typeof providerFees.tiered_rules === 'string' 
            ? JSON.parse(providerFees.tiered_rules) 
            : providerFees.tiered_rules;

          if (rules.collection && Array.isArray(rules.collection)) {
             const matchedRule = rules.collection.find((r: any) => totalCustomerCharge <= r.max) || rules.collection[rules.collection.length - 1];
             if (matchedRule) {
               pawaPayCollectionPct = matchedRule.pct || 0;
               colFixed = matchedRule.fixed || 0;
             }
          }

          if (rules.disbursement && Array.isArray(rules.disbursement)) {
             const matchedRule = rules.disbursement.find((r: any) => basePrice <= r.max) || rules.disbursement[rules.disbursement.length - 1];
             if (matchedRule) {
               pawaPayDisbursementPct = matchedRule.pct || 0;
               disbFixed = matchedRule.fixed || 0;
             }
          }
        }

        expectedCollectionCost =
          (totalCustomerCharge * (pawaPayCollectionPct / 100)) + colFixed;

        expectedDisbursementCost =
          (basePrice * (pawaPayDisbursementPct / 100)) + disbFixed;
      }

      // AT CHECKOUT: We only care about Collection Cost. 
      // Disbursement costs are charged directly to the organizer at withdrawal time.
      const totalCost = expectedCollectionCost;
      const netMargin = totalRevenue - totalCost;

      // --- OPTIMIZATION LAYER (ADAPTIVE ROUTING) ---
      let decision = "approved";
      let structuredError = null;
      let failureClassification = "OK";

      let finalOrganizerFee = organizerFee;
      let finalNetMargin = netMargin;

      if (netMargin < 0) {
        // Instead of blocking the customer, the organizer dynamically absorbs the shortfall!
        const shortfall = Math.abs(netMargin);
        finalOrganizerFee += shortfall;
        finalNetMargin = 0; // Margin is balanced because organizer absorbed the cost

        failureClassification = "ABSORBED_BY_ORGANIZER";

        // We only block if the organizer payout literally becomes negative
        // (i.e. the ticket price isn't even enough to cover the PawaPay fees)
        const organizerPayout = basePrice - finalOrganizerFee;

        if (organizerPayout < 0) {
          decision = "blocked";
          failureClassification = "NOT_FIXABLE";
          structuredError = {
            title: "❌ Transaction Blocked",
            description: "The ticket price is too low to cover the network processing fees.",
            details: {
              customerServiceFee: "N/A",
              organizerContribution: "N/A",
              totalCost: "N/A",
              shortfall: "N/A",
              message: "Network fees exceed ticket value."
            },
            recommendation: [
              "Please try another payment network."
            ]
          };
        }
      } else if (netMargin < platformBuffer) {
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
          customerServicePct,
          organizerContributionPct,
          providerFees
        },
        expected_collection_cost: expectedCollectionCost,
        expected_disbursement_cost: expectedDisbursementCost,
        expected_margin: finalNetMargin,
        decision
      });

      return {
        decision,
        failureClassification,
        serviceFee: customerFee,
        organizerFee: finalOrganizerFee,
        totalCustomerCharge,
        expectedMargin: finalNetMargin,
        structuredError,
        transactionId
      };

    } catch (e) {
      console.error("Simulation Engine Failed:", e);
      // Fail-safe block if engine crashes
      return {
        decision: "blocked",
        serviceFee: 0,
        totalCustomerCharge: basePrice,
        expectedMargin: 0,
        structuredError: {
          title: "❌ Simulation Error",
          description: "Simulation engine encountered an error.",
        },
        transactionId
      };
    }
  });
