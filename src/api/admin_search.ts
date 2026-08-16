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
        app_users: users(
          where: { _or: [
            { email: { _ilike: $q } },
            { phone: { _ilike: $q } },
            { username: { _ilike: $q } },
            { handle: { _ilike: $q } }
          ]}
          limit: 8
          order_by: { created_at: desc }
        ) {
          id
          email
          phone
          username
          handle
          country
          active
          banned
        }

        workspace_users: workspace_users(
          where: { _or: [{ name: { _ilike: $q } }, { email: { _ilike: $q } }, { role: { _ilike: $q } }] }
          limit: 5
        ) {
          id
          name
          email
          role
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
          workspaces { name }
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
          wallets { workspaces { name } }
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

        event_attendees(
          where: { _or: [
            { names: { _ilike: $q } },
            { email: { _ilike: $q } },
            { phone: { _ilike: $q } },
            { qrcode_number: { _ilike: $q } },
            { ticket_type: { _ilike: $q } }
          ]}
          limit: 6
          order_by: { created_at: desc }
        ) {
          id
          names
          email
          phone
          qrcode_number
          ticket_type
          status
          events { id title workspaces { id name } }
        }

        venue_bookings(
          where: { _or: [
            { customer_name: { _ilike: $q } },
            { customer_email: { _ilike: $q } },
            { customer_phone: { _ilike: $q } },
            { status: { _ilike: $q } },
            { payment_status: { _ilike: $q } },
            { tickets_data: { _cast: { String: { _ilike: $q } } } }
          ]}
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          customer_name
          customer_email
          customer_phone
          status
          payment_status
          start_time
          end_time
          total_amount
          tickets_data
          rentable_venue { name }
          workspace { id name }
        }

        space_subscriptions(
          where: { _or: [
            { customer_name: { _ilike: $q } },
            { customer_email: { _ilike: $q } },
            { customer_phone: { _ilike: $q } },
            { plan_name: { _ilike: $q } },
            { status: { _ilike: $q } },
            { team_members: { _cast: { String: { _ilike: $q } } } }
          ]}
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          customer_name
          customer_email
          customer_phone
          plan_name
          status
          billing_cycle
          price
          start_date
          team_members
          space { id name workspaces { id name } }
        }

        cinema_bookings(
          where: { _or: [
            { names: { _ilike: $q } },
            { email: { _ilike: $q } },
            { phone: { _ilike: $q } },
            { qrcode_number: { _ilike: $q } },
            { status: { _ilike: $q } }
          ]}
          limit: 5
          order_by: { created_at: desc }
        ) {
          id
          names
          email
          phone
          qrcode_number
          status
          total_price
          currency
          schedule { movie { id title } }
          cinema { name workspace_id }
        }
      }
      
      
    `;

    try {
      const data = await hasuraRequest<any>(gql, { q });

      // Merge all app users + workspace users into one list, deduped by email
      const seenEmails = new Set<string>();
      const mergedUsers: any[] = [];

      // App users (all registered users on the platform)
      for (const u of (data.app_users || [])) {
        const key = u.email || u.id;
        if (!seenEmails.has(key)) {
          seenEmails.add(key);
          mergedUsers.push({
            id: u.id,
            name: u.username || u.handle || u.email?.split("@")[0] || "—",
            email: u.email,
            phone: u.phone,
            country: u.country,
            active: u.active,
            banned: u.banned,
            handle: u.handle,
            _type: "app_user",
          });
        }
      }

      // Workspace users (organizer team members)
      for (const u of (data.workspace_users || [])) {
        const key = u.email || u.id;
        if (!seenEmails.has(key)) {
          seenEmails.add(key);
          mergedUsers.push({
            id: u.id,
            name: u.name || u.email?.split("@")[0] || "—",
            email: u.email,
            phone: u.phone,
            role: u.role,
            _type: "workspace_user",
          });
        }
      }

      return {
        users: mergedUsers,
        organizers: (data.organizers || []) as any[],
        support_tickets: (data.support_tickets || []) as any[],
        wallets: (data.wallets || []) as any[],
        ticket_projects: (data.ticket_projects || []) as any[],
        leads: (data.leads || []) as any[],
        wallet_transactions: (data.wallet_transactions || []) as any[],
        withdrawal_requests: (data.withdrawal_requests || []) as any[],
        event_attendees: (data.event_attendees || []) as any[],
        venue_bookings: (data.venue_bookings || []) as any[],
        space_subscriptions: (data.space_subscriptions || []) as any[],
        cinema_bookings: (data.cinema_bookings || []) as any[],
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
        event_attendees: [],
        venue_bookings: [],
        space_subscriptions: [],
        cinema_bookings: [],
      };
    }
  });
