import { hasuraRequest } from "./graphql.server";
import { sendEmail } from "./email";
import { sendSMS } from "./pindo";

const GET_DUE_SUBSCRIPTIONS = `
  query GetDueSubscriptions($now: timestamptz!) {
    subscriptions(where: {
      status: { _in: ["active", "past_due"] },
      next_billing_date: { _lte: $now },
      amount: { _gt: 0 }
    }) {
      id
      organizer_id
      plan_id
      status
      amount
      next_billing_date
      pricing_plan {
        name
        currency
      }
      organizer {
        id
        email
        phone
        name
      }
    }
  }
`;

const GET_PENDING_INVOICE = `
  query GetPendingInvoice($subscription_id: uuid!) {
    organizer_invoices(where: { subscription_id: { _eq: $subscription_id }, status: { _eq: "pending" } }, limit: 1) {
      id
    }
  }
`;

const CREATE_INVOICE = `
  mutation CreateInvoice($organizer_id: String!, $subscription_id: uuid!, $amount: numeric!) {
    insert_organizer_invoices_one(object: {
      organizer_id: $organizer_id,
      subscription_id: $subscription_id,
      amount: $amount,
      status: "pending"
    }) {
      id
    }
  }
`;

const UPDATE_SUBSCRIPTION_STATUS = `
  mutation UpdateSubscriptionStatus($id: uuid!, $status: String!) {
    update_subscriptions_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

const CANCEL_SUBSCRIPTION_AND_DOWNGRADE = `
  mutation CancelSubscriptionAndDowngrade($sub_id: uuid!, $organizer_id: uuid!, $basic_plan_modules: jsonb!) {
    update_subscriptions_by_pk(pk_columns: { id: $sub_id }, _set: { status: "canceled" }) {
      id
    }
    update_workspaces(where: { orgnizer_id: { _eq: $organizer_id } }, _set: { moduls: $basic_plan_modules }) {
      affected_rows
    }
    update_organizer_invoices(where: { subscription_id: { _eq: $sub_id }, status: { _eq: "pending" } }, _set: { status: "canceled" }) {
      affected_rows
    }
  }
`;

const GET_BASIC_PLAN_MODULES = `
  query GetBasicPlanModules {
    pricing_plans(where: { name: { _eq: "Basic" } }, limit: 1) {
      modules_included
    }
  }
`;

export async function runBillingCron() {
  const now = new Date();
  const res = await hasuraRequest<{ subscriptions: any[] }>(GET_DUE_SUBSCRIPTIONS, { now: now.toISOString() });
  const subscriptions = res.subscriptions || [];

  for (const sub of subscriptions) {
    const requiredAmountUSD = sub.amount; 
    
    const daysPastDue = Math.floor((now.getTime() - new Date(sub.next_billing_date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPastDue >= 4) {
      // Cancel subscription and downgrade
      const basicRes = await hasuraRequest<any>(GET_BASIC_PLAN_MODULES);
      const basicModules = basicRes.pricing_plans?.[0]?.modules_included || ["CORE"];
      
      await hasuraRequest(CANCEL_SUBSCRIPTION_AND_DOWNGRADE, {
        sub_id: sub.id,
        organizer_id: sub.organizer_id,
        basic_plan_modules: basicModules
      });
      
      // Send Cancellation Notice
      await notifyOrganizer(sub.organizer, "CANCELED", requiredAmountUSD);
    } else {
      // 1. Mark as past_due if not already
      if (sub.status !== "past_due") {
        await hasuraRequest(UPDATE_SUBSCRIPTION_STATUS, {
          id: sub.id,
          status: "past_due"
        });
      }
      
      // 2. Generate a pending invoice if one doesn't exist
      const invRes = await hasuraRequest<{ organizer_invoices: any[] }>(GET_PENDING_INVOICE, { subscription_id: sub.id });
      if (!invRes.organizer_invoices?.length) {
        await hasuraRequest(CREATE_INVOICE, {
          organizer_id: String(sub.organizer_id),
          subscription_id: sub.id,
          amount: requiredAmountUSD
        });
      }
      
      // 3. Send Reminder
      await notifyOrganizer(sub.organizer, "REMINDER", requiredAmountUSD, 4 - daysPastDue);
    }
  }
  
  return { processed: subscriptions.length, success: true };
}

async function notifyOrganizer(organizer: any, type: "REMINDER" | "CANCELED", amount: number, daysLeft?: number) {
  if (!organizer) return;
  
  const email = organizer.email;
  const phone = organizer.phone;
  
  if (type === "REMINDER") {
    const text = `Hi ${organizer.name || "Organizer"}, your Agatike subscription payment of $${amount} is pending. Please pay your pending invoice to avoid service disruption. You have ${daysLeft} day(s) left.`;
    
    // Send SMS
    if (phone) {
       await sendSMS(phone, text);
    }
    
    // Send Email
    if (email) {
       await sendEmail({
         to: [email],
         subject: "Action Required: Subscription Payment Pending",
         html: `<p>${text}</p>`
       });
    }
  } else if (type === "CANCELED") {
    const text = `Hi ${organizer.name || "Organizer"}, your Agatike subscription has been canceled due to non-payment. Your workspaces have been downgraded to the Basic plan.`;
    
    // Send SMS
    if (phone) {
       await sendSMS(phone, text);
    }
    
    // Send Email
    if (email) {
       await sendEmail({
         to: [email],
         subject: "Subscription Canceled",
         html: `<p>${text}</p>`
       });
    }
  }
}
