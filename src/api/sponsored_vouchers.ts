import { hasuraRequest } from "./graphql.server";

/**
 * Checks if the newly confirmed attendees should receive any sponsored vouchers
 * based on the ticket_id they purchased.
 */
export async function processSponsoredVouchersForAttendees(attendees: any[]) {
  if (!attendees || attendees.length === 0) return;

  const ticketIds = [...new Set(attendees.map((a) => a.ticket_id).filter(Boolean))];
  if (ticketIds.length === 0) return;

  const GET_TICKETS = `
    query GetTickets($ids: [uuid!]!) {
      event_tickets(where: { id: { _in: $ids } }) {
        id
        event_id
        event {
          workspace_id
        }
      }
    }
  `;

  const ticketsData = await hasuraRequest<{ event_tickets: any[] }>(GET_TICKETS, {
    ids: ticketIds,
  }).catch(() => null);

  const dbTickets = ticketsData?.event_tickets || [];
  if (dbTickets.length === 0) return;

  const eventIds = [...new Set(dbTickets.map((t) => t.event_id).filter(Boolean))];
  const workspaceIds = [...new Set(dbTickets.map((t) => t.event?.workspace_id).filter(Boolean))];

  const GET_BATCHES = `
    query GetTicketLinkedBatches($events: [uuid!], $workspaces: [uuid!]) {
      sponsored_voucher_batches(
        where: {
          generation_type: { _in: ["ticket_linked", "on_purchase"] },
          _or: [
            { event_id: { _in: $events } },
            { workspace_id: { _in: $workspaces } }
          ]
        }
      ) {
        id
        value_per_voucher
        linked_ticket_ids
        generation_type
      }
    }
  `;

  const batchesData = await hasuraRequest<{ sponsored_voucher_batches: any[] }>(GET_BATCHES, {
    events: eventIds,
    workspaces: workspaceIds,
  }).catch(() => null);

  const batches = batchesData?.sponsored_voucher_batches || [];
  if (batches.length === 0) return;

  const vouchersToInsert: any[] = [];

  for (const attendee of attendees) {
    if (!attendee.ticket_id) continue;

    for (const batch of batches) {
      if (batch.generation_type === "on_purchase") {
        vouchersToInsert.push({
          batch_id: batch.id,
          qr_code_string: `VCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          current_balance: batch.value_per_voucher,
          is_active: true,
          attendee_id: attendee.id,
          phone: attendee.phone || null,
          email: attendee.email || null,
          booking_ref: attendee.custom_fields?.booking_ref || null,
        });
      } else if (batch.generation_type === "ticket_linked") {
        const linked = Array.isArray(batch.linked_ticket_ids) ? batch.linked_ticket_ids : [];
        if (linked.includes(attendee.ticket_id)) {
          vouchersToInsert.push({
            batch_id: batch.id,
            qr_code_string: `VCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            current_balance: batch.value_per_voucher,
            is_active: true,
            attendee_id: attendee.id,
            phone: attendee.phone || null,
            email: attendee.email || null,
            booking_ref: attendee.custom_fields?.booking_ref || null,
          });
        }
      }
    }
  }

  if (vouchersToInsert.length > 0) {
    const INSERT_VOUCHERS = `
      mutation InsertVouchers($objects: [sponsored_vouchers_insert_input!]!) {
        insert_sponsored_vouchers(objects: $objects) {
          affected_rows
        }
      }
    `;

    try {
      await hasuraRequest(INSERT_VOUCHERS, { objects: vouchersToInsert });
    } catch (e) {
      console.error("[Vouchers] Failed to insert sponsored vouchers:", e);
    }
  }
}
