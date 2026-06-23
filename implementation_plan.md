# Implement PawaPay Checkout Integration

This plan outlines the steps to integrate PawaPay for Mobile Money payments (MTN, Airtel, M-Pesa, etc.) directly into the Event Ticket and Space Subscription checkout flows. 

## User Review Required

> [!WARNING]  
> PawaPay requires specific network identifiers (Correspondents) for each country (e.g., `MTN_MOMO_RWA`, `AIRTEL_OAPI_RWA`, `VODACOM_MPESA_TZA`). I will add a network selector dropdown to the payment modal, but I need to know which specific countries/networks you want to prioritize. I will start with Rwanda (MTN & Airtel), Kenya (M-Pesa), and Uganda (MTN & Airtel) by default.

## Open Questions

> [!IMPORTANT]  
> 1. **Pending Status vs Issue Immediately**: Currently, when a user clicks "Pay", the system instantly issues the ticket. With PawaPay, the user has to approve a USSD prompt on their phone first. I propose creating the tickets/subscriptions with a "Pending Payment" status, and only sending the PDF email when the PawaPay webhook says "COMPLETED". Does this approach work for you?
> 2. **Polling for Success**: To provide a seamless UI, I plan to make the checkout page poll the `wallet_transactions` table every 3 seconds after initiating the PawaPay prompt. Once the webhook updates the transaction to `COMPLETED`, the UI will automatically redirect to the success screen. Does this sound good?

## Proposed Changes

---

### UI Components (Checkout & Payment Modal)

We need to update the payment UI to collect the exact phone number and network operator required by PawaPay.

#### [MODIFY] [PaymentModal.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/shared/PaymentModal.tsx)
- Expand the "Mobile Money" option to reveal a form collecting:
  - Phone Number
  - Network Operator (Dropdown: MTN, Airtel, M-Pesa, etc.)
- Pass these details back to the parent component on "Proceed".

#### [MODIFY] [BookingMobile.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/mobile/BookingMobile.tsx) & [BookingDesktop.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/desktop/BookingDesktop.tsx)
- Update the checkout mutation to call a new `initiatePawaPayDeposit` API if Mobile Money is selected.
- Show a "Please check your phone and enter your PIN" loading state while polling for transaction success.
- Ensure tickets are only marked as "Confirmed" and PDFs generated *after* the payment succeeds.

#### [MODIFY] [VenueCheckoutMobile.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/mobile/VenueCheckoutMobile.tsx) & [VenueCheckoutDesktop.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/desktop/VenueCheckoutDesktop.tsx)
- Apply the same PawaPay Mobile Money UI changes and polling logic for venue checkouts.

#### [MODIFY] [SpaceDetailsMobile.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/mobile/SpaceDetailsMobile.tsx) & [SpaceDetailsDesktop.tsx](file:///Users/apple/Desktop/agatike-connect/src/components/desktop/SpaceDetailsDesktop.tsx)
- Integrate the PawaPay Mobile Money UI into the subscription purchase flow.
- Ensure subscriptions are created as "Pending" and activated upon successful payment webhook.

---

### API Layer

We need to create the endpoints to interact with PawaPay's `/v1/deposits` API.

#### [MODIFY] [pawapay.ts](file:///Users/apple/Desktop/agatike-connect/src/api/pawapay.ts)
- Add a new RPC function `initiatePawaPayDeposit({ amount, phone, network, type, referenceId })`.
- This function will:
  1. Call PawaPay's `/v1/deposits` endpoint using the `PAWAPAY_API_KEY`.
  2. Create a pending record in `wallet_transactions` with the returned `depositId`.
- Update the existing webhook handler:
  - When status becomes `COMPLETED`, find the associated ticket/subscription via `provider_reference` and update its status to "Confirmed" / "Active".
  - If it's a ticket, trigger the PDF generation and email sending logic from the backend instead of the frontend.

## Verification Plan

### Automated Tests
- N/A - Testing will rely on manual flow verification.

### Manual Verification
- Attempt to buy a paid event ticket using the Mobile Money option.
- Verify the PawaPay API is called and returns a `depositId`.
- Simulate a webhook success call to our `pawapay/deposits` endpoint.
- Verify the UI automatically detects the success and shows the confirmation screen.
- Verify the ticket PDF is emailed.
- Repeat the process for purchasing a Space Subscription.
