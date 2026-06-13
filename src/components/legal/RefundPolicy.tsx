import React from "react";

export function RefundPolicy() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
      <h2 className="text-2xl font-bold text-foreground mb-6">REFUND POLICY</h2>
      <p>
        Refund eligibility depends on the type of service, event organizer rules, and applicable
        laws. In general, ticket purchases are non-refundable unless otherwise stated at the time of
        purchase. Refunds may be granted in specific cases, such as event cancellation, significant
        event rescheduling, duplicate payments, or verified technical errors that result in
        incorrect charges.
      </p>

      <p>
        If an event is cancelled by the organizer, users will typically be entitled to a full refund
        of the ticket price. In cases where an event is rescheduled, users may be offered the option
        to either retain their ticket for the new date or request a refund within a specified
        timeframe. Service fees or processing charges may be non-refundable unless required by law.
      </p>

      <p>
        Refund requests must be submitted through our support channels and will be reviewed in
        accordance with our policies and the applicable event terms. Approved refunds will be
        processed within a reasonable timeframe, which may vary depending on the payment provider,
        typically between 5 to 14 business days. We are not responsible for delays caused by banks
        or third-party payment processors. Abuse of the refund system or fraudulent chargeback
        attempts may result in account restrictions or suspension.
      </p>
    </div>
  );
}
