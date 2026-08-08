import { hasuraRequest } from "../src/api/graphql.server";
import { addMoneyToWorkspaceWallet } from "../src/api/wallet";

async function fixStuckWithdrawals() {
  const query = `
    query GetStuck {
      wallet_transactions(where: { type: { _eq: "withdrawal" }, status: { _eq: "pending" }, provider_status: { _eq: "REJECTED" } }) {
        id
        amount
        workspace_id
        provider_reference
      }
    }
  `;
  
  const res = await hasuraRequest(query);
  const stuck = res.wallet_transactions || [];
  
  console.log(`Found ${stuck.length} stuck withdrawals.`);
  
  for (const tx of stuck) {
    console.log(`Refunding ${tx.amount} to workspace ${tx.workspace_id} for tx ${tx.id}`);
    
    // Refund wallet
    await addMoneyToWorkspaceWallet({
      data: {
        workspace_id: tx.workspace_id,
        amount: parseFloat(tx.amount),
      }
    });

    // Mark as failed
    await hasuraRequest(`
      mutation MarkFailed($id: uuid!) {
        update_wallet_transactions_by_pk(pk_columns: { id: $id }, _set: { status: "failed" }) {
          id
        }
      }
    `, { id: tx.id });
  }
  
  console.log("Done.");
}

fixStuckWithdrawals().catch(console.error);
