import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getWorkspaceActivePlanFees } from "./billing";
import { getPaymentProviderFees } from "./pawapay";

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
          }
        }
      `, { workspaceId, network, countryCode: countryCode || "RWA" });
      
      const organizerId = combinedRes.workspaces_by_pk?.orgnizer_id;
      const providerFees = combinedRes.payment_provider_fees?.[0];

      // Fetch pricing plan (subscription rules)
      const planFees = await getWorkspaceActivePlanFees({ data: { organizer_id: organizerId } } as any);
      
      const customerServicePct = planFees.customer_service_fee_percentage || 2.0;
      const organizerContributionPct = planFees.organizer_platform_contribution || 0;
      
      // Calculate Customer Service Fee
      const serviceFee = (basePrice * customerServicePct) / 100;
      const totalCustomerCharge = basePrice + serviceFee;
      
      // PawaPay Collection Cost
      let expectedCollectionCost = 0;
      let expectedDisbursementCost = 0;
      
      if (providerFees) {
        expectedCollectionCost = 
          (totalCustomerCharge * (providerFees.collection_percentage / 100)) + 
          (providerFees.collection_fixed_fee || 0);
          
        expectedDisbursementCost = 
          (basePrice * (providerFees.disbursement_percentage / 100)) + 
          (providerFees.disbursement_fixed_fee || 0);
      }

      // Agatike Profit strictly defined as:
      // (Customer Service Fee + Organizer Platform Contribution) - Actual pawaPay Collection Cost - Actual pawaPay Disbursement Cost
      const expectedMargin = 
        (serviceFee + (basePrice * (organizerContributionPct / 100))) 
        - expectedCollectionCost; 
        // We only deduct collection cost upfront for the immediate transaction margin, 
        // but we can log expected disbursement for the future.

      let decision = "approved";
      
      if (expectedMargin < 0) {
        decision = "blocked";
      } else if (expectedMargin < (totalCustomerCharge * 0.005)) { // Less than 0.5% margin
        decision = "flagged";
      }

      // Store ledger transaction (fee_simulations)
      await hasuraRequest(LOG_SIMULATION, {
        transaction_id: transactionId,
        input_snapshot: {
          basePrice,
          totalCustomerCharge,
          serviceFee,
          organizerId,
          network,
          countryCode,
          customerServicePct,
          organizerContributionPct,
          providerFees
        },
        expected_collection_cost: expectedCollectionCost,
        expected_disbursement_cost: expectedDisbursementCost,
        expected_margin: expectedMargin,
        decision
      });

      return {
        decision,
        serviceFee,
        totalCustomerCharge,
        expectedMargin,
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
        transactionId,
        error: "Simulation engine encountered an error."
      };
    }
  });
