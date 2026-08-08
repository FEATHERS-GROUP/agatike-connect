import React from "react";

export function PrivacyPolicy() {
  return (
    <article
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        maxWidth: 720,
        margin: "0 auto",
        color: "var(--foreground)",
      }}
    >
      {/* ── Page header ─────────────────────────────────────── */}
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
          Privacy Policy
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            margin: "0 0 1.75rem",
          }}
        >
          How we collect, use, and protect your personal information when you use our platform.
        </p>

        <div style={{ height: "1px", background: "var(--border)", opacity: 0.55 }} />
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>

        <section>
          <h2 style={hs}>Introduction</h2>
          <p style={ps}>
            We respect your privacy and are committed to protecting your personal data in accordance
            with applicable international data protection laws. When you use our platform, we may
            collect personal information including your name, email address, phone number, profile
            details, location data (where applicable), device information, usage activity, and any
            information necessary to provide our services.
          </p>
          <p style={ps}>
            In addition, for security, identity verification, fraud prevention, and compliance
            purposes, we may collect and process sensitive identity information such as
            government-issued identification documents, including national identity cards, passports,
            driving licenses, and other official identification documents. This information may be
            used for user verification (KYC), access control to secure facilities, prevention of
            unauthorized access, and compliance with legal or regulatory obligations.
          </p>
          <p style={ps}>
            We do not sell your personal data. We may share limited personal information, including
            identity verification data where strictly necessary, with trusted third-party service
            providers. All third parties are contractually required to handle your data securely,
            confidentially, and only for the purposes we specify.
          </p>
          <p style={ps}>
            We implement strong technical, administrative, and organizational security measures to
            protect your data, including encrypted storage and restricted access controls. However,
            no system can be guaranteed 100% secure, and you acknowledge that you use the platform
            at your own risk.
          </p>
        </section>

        <section>
          <h2 style={hs}>Sensitive Personal Data</h2>
          <h3 style={shs}>While posting the personal data without consent of the company</h3>
          <p style={ps}>
            Depending on your jurisdiction, you may have rights over your personal data, including
            the right to access, correct, update, or request deletion of your information, subject
            to legal and security retention requirements. Identity verification data may be retained
            for as long as necessary to comply with legal obligations, prevent fraud, and maintain
            platform security.
          </p>
          <p style={ps}>
            By using our platform, you explicitly consent to the collection, processing, and storage
            of your personal data, including sensitive identity documents, as described in this
            Privacy Policy. You also acknowledge that your information may be transferred and stored
            in countries outside your place of residence where necessary for service operation,
            subject to appropriate safeguards.
          </p>
        </section>

        <section>
          <h2 style={hs}>KYC (Know Your Customer) &amp; Identity Verification Policy</h2>
          <p style={ps}>
            To ensure the security of our platform, prevent fraud, and comply with legal and
            regulatory obligations, we may require users to complete identity verification
            procedures.
          </p>
          <p style={ps}>
            As part of this process, we may collect and verify government-issued identification
            documents, including but not limited to national identity cards, passports,
            driver&apos;s licenses, and other official documents. We may also request additional
            information such as a selfie or biometric verification to confirm that the identity
            provided belongs to the account holder.
          </p>
          <p style={ps}>The purpose of identity verification includes:</p>
          <ul style={ls}>
            {[
              "Preventing fraud, impersonation, and unauthorized access",
              "Securing office access and controlled facilities",
              "Ensuring authenticity of ticket buyers, sellers, and organizers",
              "Complying with applicable legal, regulatory, and security requirements",
              "Maintaining the integrity and safety of the platform community",
            ].map((item, i) => (
              <li key={i} style={lis}>{item}</li>
            ))}
          </ul>
          <p style={ps}>
            Users agree that all submitted identity information is accurate, valid, and belongs to
            them. Submission of false, forged, or altered documents is strictly prohibited and may
            result in immediate account suspension or permanent termination.
          </p>
        </section>

        <section>
          <h2 style={hs}>Data Retention Policy</h2>
          <p style={ps}>
            We retain personal data only for as long as necessary to fulfill the purposes for which
            it was collected, including providing services, complying with legal obligations,
            resolving disputes, enforcing agreements, and ensuring platform security.
          </p>
          <p style={ps}>
            Identity verification data (including passports, national IDs, and related documents)
            may be retained for a limited period even after account closure, where required for
            fraud prevention, legal compliance, or security purposes. The exact retention period may
            vary depending on applicable laws and regulatory requirements in different jurisdictions.
          </p>
          <p style={ps}>
            When personal data is no longer required, we will take reasonable steps to securely
            delete, anonymize, or irreversibly destroy it in accordance with industry security
            standards.
          </p>
        </section>

        <section>
          <h2 style={hs}>Data Deletion Policy (Right to be Forgotten)</h2>
          <p style={ps}>
            Users may request deletion of their personal data at any time by contacting our support
            team or using account deletion tools within the platform.
          </p>
          <p style={ps}>Upon receiving a valid deletion request, we will:</p>
          <ul style={ls}>
            {[
              "Delete or anonymize personal profile data where legally permissible",
              "Remove access to the user account",
              "Delete stored content such as posts, messages, and profile information",
            ].map((item, i) => (
              <li key={i} style={lis}>{item}</li>
            ))}
          </ul>
          <p style={ps}>However, certain data may be retained where necessary, including:</p>
          <ul style={ls}>
            {[
              "Identity verification data required for legal compliance or fraud prevention",
              "Transaction records required for financial auditing or dispute resolution",
              "Data required to comply with applicable laws or enforce legal rights",
            ].map((item, i) => (
              <li key={i} style={lis}>{item}</li>
            ))}
          </ul>
          <p style={ps}>
            Once data is deleted, recovery will not be possible. Users acknowledge that deletion may
            result in permanent loss of access to their account and associated data.
          </p>
        </section>

        {/* Consent blockquote */}
        <blockquote
          style={{
            margin: "0 0 2rem",
            padding: "1.2rem 1.5rem",
            borderLeft: "3px solid var(--primary)",
            background: "color-mix(in oklch, var(--primary) 7%, transparent)",
            borderRadius: "0 0.5rem 0.5rem 0",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              fontStyle: "italic",
              fontWeight: 600,
              color: "var(--foreground)",
              lineHeight: 1.7,
            }}
          >
            "I agree to provide valid government-issued identification for verification purposes."
          </p>
        </blockquote>

      </div>
    </article>
  );
}

/* ── Shared style objects ─────────────────────────────── */
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
  margin: "0 0 0.75rem",
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
  gap: "0.4rem",
};

const lis: React.CSSProperties = {
  fontSize: "0.9rem",
  lineHeight: 1.7,
  color: "var(--muted-foreground)",
};
