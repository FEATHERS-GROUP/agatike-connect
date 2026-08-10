import React from "react";

export function RefundPolicy() {
  return (
    <article
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        maxWidth: 720,
        margin: "0 auto",
        color: "var(--foreground)",
      }}
    >
      {/* ── Header ── */}
      <header style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--primary)",
            marginBottom: "0.9rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--primary)",
              flexShrink: 0,
            }}
          />
          Legal
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            margin: "0 0 1rem",
            color: "var(--foreground)",
          }}
        >
          Refund Policy
        </h1>

        <p style={{ ...ps, fontSize: "1.05rem", margin: "0 0 1.75rem" }}>
          Understand when and how you can request a refund for tickets and services purchased on our
          platform. Please read this policy carefully before making a purchase, as it governs all
          transactions completed through our website, mobile application, and any affiliated sales
          channels.
        </p>

        <div style={{ height: "1px", background: "var(--border)", opacity: 0.55 }} />
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>
        {/* 1. Refund Eligibility */}
        <section>
          <h2 style={hs}>1. Refund Eligibility</h2>
          <p style={ps}>
            Refund eligibility depends on several factors, including the type of service purchased,
            the rules set by the individual event organizer, the payment method used, and applicable
            local, state, or federal laws.
          </p>
          <p style={ps}>
            As a general rule, all ticket purchases are considered{" "}
            <strong style={{ color: "var(--foreground)" }}>final and non-refundable</strong> unless
            otherwise stated at the time of purchase or required by law. However, refunds may be
            granted under the following circumstances:
          </p>
          <ul style={ls}>
            <li style={lis}>
              The event is <strong style={bold}>cancelled</strong> by the organizer and not
              rescheduled.
            </li>
            <li style={lis}>
              The event is <strong style={bold}>significantly rescheduled</strong> (date, venue, or
              lineup changes materially affecting the original purchase).
            </li>
            <li style={lis}>
              A <strong style={bold}>duplicate payment</strong> was made for the same order due to a
              technical or processing error.
            </li>
            <li style={lis}>
              A <strong style={bold}>verified technical error</strong> on our platform resulted in
              an incorrect charge (e.g., wrong ticket type, incorrect quantity, or a failed
              transaction that was still charged).
            </li>
            <li style={lis}>
              The purchase is covered by a{" "}
              <strong style={bold}>mandatory legal refund right</strong> in the buyer's jurisdiction
              (such as consumer protection laws requiring refunds within a cooling-off period).
            </li>
          </ul>
          <p style={ps}>
            Refunds are evaluated on a case-by-case basis, and approval is not guaranteed simply
            because a request falls into one of the categories above. Each case is reviewed against
            the organizer's specific terms and our internal policies.
          </p>

          <h3 style={shs}>1.1 Non-Refundable Circumstances</h3>
          <p style={ps}>
            Except where required by law, the following are generally{" "}
            <strong style={{ color: "var(--foreground)" }}>not</strong> eligible for a refund:
          </p>
          <ul style={ls}>
            <li style={lis}>Change of mind or inability to attend for personal reasons.</li>
            <li style={lis}>
              Failure to use a ticket, voucher, or credit before its expiration date.
            </li>
            <li style={lis}>
              Incorrect purchases made due to buyer error (e.g., wrong date, wrong venue, wrong
              ticket category) where the listing was accurate.
            </li>
            <li style={lis}>
              Minor changes to an event that do not materially affect the core experience (e.g., a
              supporting act change, small time adjustments, or venue amenities).
            </li>
            <li style={lis}>
              Tickets purchased through unauthorized third-party resellers or secondary
              marketplaces.
            </li>
          </ul>
        </section>

        <div style={divider} />

        {/* 2. Cancelled & Rescheduled */}
        <section>
          <h2 style={hs}>2. Cancelled &amp; Rescheduled Events</h2>

          <h3 style={shs}>2.1 Cancelled Events</h3>
          <p style={ps}>
            Our platform provides the technology to list, sell, and process payments for tickets;{" "}
            <strong style={{ color: "var(--foreground)" }}>
              we are not the organizer, host, or venue owner
            </strong>
            , and we do not control decisions to cancel an event or permanently close a venue or
            space. Accordingly:
          </p>
          <ul style={ls}>
            <li style={lis}>
              If an event is <strong style={bold}>cancelled</strong> by the organizer, or a
              venue/space is <strong style={bold}>permanently closed</strong>, responsibility for
              issuing a refund lies with the{" "}
              <strong style={bold}>organizer, host, or venue owner</strong> - not with our platform.
              Affected users must negotiate refund terms directly with the relevant organizer or
              host.
            </li>
            <li style={lis}>
              Upon notice of a cancellation or permanent closure, we will{" "}
              <strong style={bold}>hold ("block") any remaining funds</strong> owed to the organizer
              that have not yet been paid out, up to the amount reasonably necessary to cover
              affected ticket purchases. These funds will not be released to the organizer until a
              refund arrangement with affected users has been resolved or otherwise confirmed.
            </li>
            <li style={lis}>
              Any funds <strong style={bold}>already paid out</strong> to the organizer prior to the
              cancellation notice are <strong style={bold}>not held or recovered by us</strong> and
              must be{" "}
              <strong style={bold}>
                negotiated directly between the user and the organizer or host
              </strong>
              .
            </li>
            <li style={lis}>
              We facilitate communication between users and organizers where possible, but we do not
              guarantee, underwrite, or issue refunds on the organizer's behalf for cancelled events
              or permanently closed venues.
            </li>
            <li style={lis}>
              Users are encouraged to keep records of their purchase (order confirmation, payment
              receipt) when pursuing a refund directly with the organizer or host.
            </li>
          </ul>

          <h3 style={shs}>2.2 Rescheduled Events</h3>
          <p style={ps}>
            If an event is <strong style={bold}>rescheduled</strong>, users are generally given the
            choice to:
          </p>
          <ol style={{ ...ls, listStyle: "decimal" }}>
            <li style={lis}>
              <strong style={bold}>Retain their existing ticket</strong> for the new event date, or
            </li>
            <li style={lis}>
              <strong style={bold}>Request a refund</strong> within a specified timeframe
              communicated at the time of the rescheduling announcement.
            </li>
          </ol>
          <p style={ps}>
            If no action is taken within the stated window, tickets may automatically be honored for
            the new date, depending on the organizer's policy. Specific deadlines and options will
            be communicated via email and/or account notifications when a rescheduling occurs.
          </p>

          <h3 style={shs}>2.3 Non-Refundable Fees</h3>
          <p style={ps}>
            <strong style={{ color: "var(--foreground)" }}>
              Service fees, booking fees, delivery charges, and payment processing charges are
              generally non-refundable
            </strong>
            , even when the ticket price itself is refunded, unless refunding such fees is required
            by applicable law. This applies to both cancelled and rescheduled events.
          </p>
        </section>

        <div style={divider} />

        {/* 3. Process & Timeline */}
        <section>
          <h2 style={hs}>3. Refund Process &amp; Timeline</h2>

          <h3 style={shs}>3.1 Submitting a Request</h3>
          <p style={ps}>
            Refund requests must be submitted through our official support channels (help center,
            support email, or in-app request form). Requests should include:
          </p>
          <ul style={ls}>
            <li style={lis}>Order or confirmation number</li>
            <li style={lis}>Name and email address associated with the purchase</li>
            <li style={lis}>Reason for the refund request</li>
            <li style={lis}>
              Any supporting documentation, if applicable (e.g., proof of duplicate charge)
            </li>
          </ul>

          <h3 style={shs}>3.2 Review Process</h3>
          <p style={ps}>
            All refund requests are reviewed in accordance with this policy and the specific terms
            set by the relevant event organizer. Some events may have stricter or more lenient
            refund terms disclosed at the point of sale, which will take precedence over this
            general policy where applicable.
          </p>

          <h3 style={shs}>3.3 Processing Time</h3>
          <p style={ps}>
            Once a refund is <strong style={bold}>approved</strong>, it will be processed within a
            reasonable timeframe, typically <strong style={bold}>5 to 14 business days</strong>,
            depending on:
          </p>
          <ul style={ls}>
            <li style={lis}>
              The original payment method (credit card, debit card, digital wallet, bank transfer,
              etc.)
            </li>
            <li style={lis}>The policies of the issuing bank or payment provider</li>
            <li style={lis}>Whether the transaction involved currency conversion</li>
          </ul>
          <p style={ps}>
            We are{" "}
            <strong style={{ color: "var(--foreground)" }}>not responsible for delays</strong>{" "}
            caused by banks, card issuers, or third-party payment processors once a refund has been
            initiated on our end. Refunds are generally issued to the original form of payment;
            refunds to an alternate payment method are not guaranteed and may be handled at our
            discretion.
          </p>

          <h3 style={shs}>3.4 Partial Refunds</h3>
          <p style={ps}>
            In some cases, only a partial refund may be issued - for example, when only a portion of
            an order is affected (such as one ticket in a multi-ticket order) or when non-refundable
            fees are deducted from the total.
          </p>
        </section>

        <div style={divider} />

        {/* 4. Chargebacks */}
        <section>
          <h2 style={hs}>4. Chargebacks &amp; Fraud Prevention</h2>
          <p style={ps}>
            Users are encouraged to contact our support team before initiating a chargeback with
            their bank or card issuer, as this often allows for a faster resolution.
          </p>
          <p style={ps}>
            <strong style={{ color: "var(--foreground)" }}>
              Abuse of the refund system, fraudulent refund claims, or unauthorized chargeback
              attempts
            </strong>{" "}
            may result in one or more of the following actions:
          </p>
          <ul style={ls}>
            <li style={lis}>Denial of the refund request</li>
            <li style={lis}>Reversal of any goods or credits issued</li>
            <li style={lis}>Restriction or suspension of the user's account</li>
            <li style={lis}>
              Reporting to relevant payment processors or fraud prevention networks
            </li>
          </ul>
        </section>

        <div style={divider} />

        {/* 5. Special Circumstances */}
        <section>
          <h2 style={hs}>5. Special Circumstances</h2>
          <p style={ps}>
            We may, at our sole discretion, offer refunds, credits, or alternative remedies outside
            the scope of this policy in exceptional circumstances, such as documented medical
            emergencies, bereavement, or other extenuating situations. Such accommodations are not
            guaranteed and are evaluated individually.
          </p>
        </section>

        <div style={divider} />

        {/* 6. Changes */}
        <section>
          <h2 style={hs}>6. Changes to This Policy</h2>
          <p style={ps}>
            We reserve the right to update or modify this Refund Policy at any time. Material
            changes will be communicated through our website or via notification. The refund terms
            in effect <strong style={bold}>at the time of purchase</strong> will generally apply to
            that transaction, unless a change is required by law.
          </p>
        </section>

        <div style={divider} />

        {/* 7. Contact */}
        <section>
          <h2 style={hs}>7. Contact Us</h2>
          <p style={ps}>
            If you have questions about this Refund Policy or need to submit a refund request,
            please reach out through our official support channels listed on our website or mobile
            app.
          </p>
        </section>


      </div>
    </article>
  );
}

/* ── Shared styles ── */
const hs: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--primary)",
  margin: "0 0 0.85rem",
  letterSpacing: "0.005em",
};

const shs: React.CSSProperties = {
  fontSize: "0.92rem",
  fontWeight: 600,
  color: "var(--foreground)",
  margin: "1.4rem 0 0.65rem",
};

const ps: React.CSSProperties = {
  fontSize: "0.9rem",
  lineHeight: 1.82,
  color: "var(--muted-foreground)",
  margin: "0 0 0.9rem",
};

const ls: React.CSSProperties = {
  listStyle: "disc",
  paddingLeft: "1.35rem",
  margin: "0 0 0.9rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
};

const lis: React.CSSProperties = {
  fontSize: "0.9rem",
  lineHeight: 1.75,
  color: "var(--muted-foreground)",
};

const bold: React.CSSProperties = {
  color: "var(--foreground)",
  fontWeight: 600,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
  opacity: 0.45,
  marginTop: "-0.5rem",
};
