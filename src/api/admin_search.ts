import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getAdminSession } from "./admin_auth";

export const adminGlobalSearch = createServerFn({ method: "POST" })
  .validator((d: { query: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const q = `%${ctx.data.query.trim()}%`;

    const gql = `
      query AdminGlobalSearch($q: String!) {
        users: workspace_users(
          where: { _or: [{ name: { _ilike: $q } }, { email: { _ilike: $q } }, { phone: { _ilike: $q } }] }
          limit: 5
        ) {
          id
          name
          email
          phone
        }

        organizers(
          where: { _or: [{ name: { _ilike: $q } }, { email: { _ilike: $q } }, { phone: { _ilike: $q } }, { handle: { _ilike: $q } }] }
          limit: 5
        ) {
          id
          name
          email
          handle
          image
        }

        support_tickets(
          where: { _or: [{ subject: { _ilike: $q } }, { description: { _ilike: $q } }, { status: { _ilike: $q } }] }
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          subject
          status
          priority
          created_at
          organizer { name email }
        }

        wallets(
          where: { _or: [{ walletNumber: { _ilike: $q } }] }
          limit: 5
        ) {
          id
          walletNumber
          amount
          currency
          workspace { name }
        }

        ticket_projects(
          where: { _and: [
            { deleted: { _eq: false } },
            { _or: [{ name: { _ilike: $q } }, { logoText: { _ilike: $q } }, { template: { _ilike: $q } }] }
          ]}
          limit: 5
          order_by: { updated_on: desc }
        ) {
          id
          name
          logoText
          template
          workspace { id name }
        }

        leads(
          where: { _or: [{ name: { _ilike: $q } }, { email: { _ilike: $q } }, { phone: { _ilike: $q } }, { company: { _ilike: $q } }] }
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          name
          email
          phone
          company
          status
        }

        wallet_transactions(
          where: { _or: [
            { reference_id: { _ilike: $q } },
            { type: { _ilike: $q } },
            { description: { _ilike: $q } },
            { provider_reference: { _ilike: $q } }
          ]}
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          reference_id
          type
          status
          amount
          currency
          created_at
          workspace_id
          wallets { workspace { name } }
        }

        withdrawal_requests(
          where: { _or: [
            { payout_account: { _ilike: $q } },
            { payout_method: { _ilike: $q } },
            { status: { _ilike: $q } }
          ]}
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          amount
          currency
          status
          payout_account
          payout_method
          created_at
          workspace { name }
        }
      }
    `;

    try {
      const data = await hasuraRequest<any>(gql, { q });

      return {
        users: (data.users || []) as any[],
        organizers: (data.organizers || []) as any[],
        support_tickets: (data.support_tickets || []) as any[],
        wallets: (data.wallets || []) as any[],
        ticket_projects: (data.ticket_projects || []) as any[],
        leads: (data.leads || []) as any[],
        wallet_transactions: (data.wallet_transactions || []) as any[],
        withdrawal_requests: (data.withdrawal_requests || []) as any[],
      };
    } catch (e: any) {
      console.error("[Admin Search] Error:", e);
      return {
        users: [],
        organizers: [],
        support_tickets: [],
        wallets: [],
        ticket_projects: [],
        leads: [],
        wallet_transactions: [],
        withdrawal_requests: [],
      };
    }
  });
