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
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
          Legal
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, margin: "0 0 1rem", color: "var(--foreground)" }}>
          Privacy Policy
        </h1>

        <p style={{ ...ps, fontSize: "1.05rem", margin: "0 0 1.75rem" }}>
          Understand how we collect, use, store, and protect your personal information when you use our platform.
        </p>

        <div style={{ height: "1px", background: "var(--border)", opacity: 0.55 }} />
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>

        {/* 1 */}
        <section>
          <h2 style={hs}>1. Introduction</h2>
          <p style={ps}>
            We respect your privacy and are committed to protecting your personal data in accordance with applicable international data protection laws and regulations. This Privacy Policy explains what information we collect, why we collect it, how we use and share it, and the choices and rights available to you.
          </p>
          <p style={ps}>
            By accessing or using our platform, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </section>

        <div style={divider} />

        {/* 2 */}
        <section>
          <h2 style={hs}>2. Information We Collect</h2>

          <h3 style={shs}>2.1 Information You Provide</h3>
          <p style={ps}>When you use our platform, we may collect personal information including, but not limited to:</p>
          <ul style={ls}>
            {["Full name","Email address","Phone number","Profile details (e.g., photo, bio, preferences)","Payment and billing information","Communications with our support team"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>2.2 Information Collected Automatically</h3>
          <p style={ps}>We may also automatically collect:</p>
          <ul style={ls}>
            {[
              "Location data, where applicable and with your permission",
              "Device information (device type, operating system, browser type, IP address)",
              "Usage activity (pages visited, features used, timestamps, interaction logs)",
              "Any other information reasonably necessary to provide, maintain, and improve our services",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>2.3 Sensitive Identity Information (KYC Data)</h3>
          <p style={ps}>
            For security, identity verification, fraud prevention, and regulatory compliance purposes, we may collect and process sensitive identity information, including:
          </p>
          <ul style={ls}>
            <li style={lis}>Government-issued identification documents (national identity cards, passports, driver's licenses, or other official documents)</li>
            <li style={lis}>Selfie or biometric verification data used to confirm that the identity provided belongs to the account holder</li>
          </ul>
          <p style={ps}>
            This information may be used for identity verification (KYC), access control to secure facilities, prevention of unauthorized access, and compliance with legal or regulatory obligations.
          </p>
        </section>

        <div style={divider} />

        {/* 3 */}
        <section>
          <h2 style={hs}>3. How We Use Your Information</h2>
          <p style={ps}>We use the information we collect to:</p>
          <ul style={ls}>
            {[
              "Provide, operate, and maintain our platform and services",
              "Verify user identity and prevent fraud, impersonation, or unauthorized access",
              "Process transactions and payments",
              "Communicate with you regarding your account, orders, or support requests",
              "Improve, personalize, and develop new features",
              "Enforce our Terms of Service and other policies",
              "Comply with applicable legal, regulatory, and security requirements",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
        </section>

        <div style={divider} />

        {/* 4 */}
        <section>
          <h2 style={hs}>4. Sensitive Personal Data &amp; User-Submitted Content</h2>
          <p style={ps}>
            Users may not post, upload, or share another individual's personal data on our platform without that individual's explicit consent. This includes, but is not limited to, names, contact details, images, identification numbers, or any other information that could identify a third party. Content submitted in violation of this rule may be removed, and the responsible account may be subject to restriction or suspension.
          </p>
          <p style={ps}>
            We do not sell your personal data to third parties.
          </p>
          <p style={ps}>
            We may share limited personal information — including identity verification data, where strictly necessary — with trusted third-party service providers who assist us in operating our platform (such as payment processors, identity verification providers, hosting providers, and analytics services). All third parties are contractually required to handle your data securely, confidentially, and solely for the purposes we specify.
          </p>
          <p style={ps}>
            We may also disclose personal information where required to comply with a legal obligation, enforce our agreements, protect the rights and safety of our users, or respond to a valid request from a governmental or regulatory authority.
          </p>
        </section>

        <div style={divider} />

        {/* 5 */}
        <section>
          <h2 style={hs}>5. KYC (Know Your Customer) &amp; Identity Verification Policy</h2>
          <p style={ps}>
            To ensure the security of our platform, prevent fraud, and comply with legal and regulatory obligations, we may require users to complete identity verification procedures before accessing certain features or services.
          </p>

          <h3 style={shs}>5.1 Purpose of Identity Verification</h3>
          <p style={ps}>Identity verification is conducted for the following purposes:</p>
          <ul style={ls}>
            {[
              "Preventing fraud, impersonation, and unauthorized access",
              "Securing office access and controlled facilities",
              "Ensuring the authenticity of ticket buyers, sellers, and organizers",
              "Complying with applicable legal, regulatory, and security requirements",
              "Maintaining the integrity and safety of the platform community",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>5.2 User Obligations</h3>
          <p style={ps}>
            By submitting identity documents, users represent and warrant that all information provided is accurate, valid, current, and belongs to them. The submission of false, forged, altered, or stolen documents is strictly prohibited and may result in immediate account suspension, permanent termination, and reporting to relevant authorities where applicable.
          </p>

          <blockquote style={bq}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontStyle: "italic", fontWeight: 600, color: "var(--foreground)", lineHeight: 1.7 }}>
              By using our platform, you explicitly consent to the collection, processing, and storage of your personal data — including sensitive identity documents — as described in this Privacy Policy, and you confirm: "I agree to provide valid government-issued identification for verification purposes."
            </p>
          </blockquote>
        </section>

        <div style={divider} />

        {/* 6 */}
        <section>
          <h2 style={hs}>6. Data Security</h2>
          <p style={ps}>
            We implement strong technical, administrative, and organizational security measures designed to protect your data, including encrypted storage, restricted access controls, and regular security reviews.
          </p>
          <p style={ps}>
            However, no method of transmission or storage is 100% secure. While we work to protect your personal information, you acknowledge and accept that you use the platform at your own risk, and we cannot guarantee absolute security against unauthorized access, loss, misuse, or alteration of data.
          </p>
        </section>

        <div style={divider} />

        {/* 7 */}
        <section>
          <h2 style={hs}>7. International Data Transfers</h2>
          <p style={ps}>
            You acknowledge that your information may be transferred to, stored, and processed in countries outside your place of residence where necessary for the operation of our services. Where such transfers occur, we take reasonable steps to ensure appropriate safeguards are in place, consistent with applicable data protection laws.
          </p>
        </section>

        <div style={divider} />

        {/* 8 */}
        <section>
          <h2 style={hs}>8. Data Retention Policy</h2>
          <p style={ps}>We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including:</p>
          <ul style={ls}>
            {["Providing our services","Complying with legal and regulatory obligations","Resolving disputes","Enforcing our agreements","Maintaining platform security"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Identity verification data (including passports, national IDs, and related documents) may be retained for a limited period even after account closure, where required for fraud prevention, legal compliance, or security purposes. The exact retention period may vary depending on applicable laws and regulatory requirements in the relevant jurisdiction.
          </p>
          <p style={ps}>
            When personal data is no longer required, we will take reasonable steps to securely delete, anonymize, or irreversibly destroy it in accordance with industry security standards.
          </p>
        </section>

        <div style={divider} />

        {/* 9 */}
        <section>
          <h2 style={hs}>9. Data Deletion Policy (Right to Be Forgotten)</h2>
          <p style={ps}>
            Users may request deletion of their personal data at any time by contacting our support team or using the account deletion tools available within the platform.
          </p>

          <h3 style={shs}>9.1 Upon a Valid Deletion Request, We Will:</h3>
          <ul style={ls}>
            {["Delete or anonymize personal profile data, where legally permissible","Remove access to the user account","Delete stored content such as posts, messages, and profile information"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>9.2 Data That May Be Retained</h3>
          <p style={ps}>Certain data may be retained even after a deletion request, including:</p>
          <ul style={ls}>
            {["Identity verification data required for legal compliance or fraud prevention","Transaction records required for financial auditing or dispute resolution","Data required to comply with applicable laws or to enforce our legal rights"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Once data is deleted, recovery will not be possible. Users acknowledge that deletion may result in the permanent loss of access to their account and any associated data.
          </p>
        </section>

        <div style={divider} />

        {/* 10 */}
        <section>
          <h2 style={hs}>10. Your Rights</h2>
          <p style={ps}>Depending on your jurisdiction, you may have rights over your personal data, including the right to:</p>
          <ul style={ls}>
            {[
              "Access the personal data we hold about you",
              "Correct or update inaccurate or incomplete data",
              "Request deletion of your data, subject to legal and security retention requirements",
              "Object to or restrict certain processing of your data",
              "Request a copy of your data in a portable format, where applicable",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            To exercise any of these rights, please contact our support team using the details provided below. We may need to verify your identity before processing your request.
          </p>
        </section>

        <div style={divider} />

        {/* 11 */}
        <section>
          <h2 style={hs}>11. Children's Privacy</h2>
          <p style={ps}>
            Our platform is not intended for use by individuals under the minimum age required by applicable law in their jurisdiction. We do not knowingly collect personal data from children. If we become aware that we have inadvertently collected such information, we will take reasonable steps to delete it.
          </p>
        </section>

        <div style={divider} />

        {/* 12 */}
        <section>
          <h2 style={hs}>12. Changes to This Privacy Policy</h2>
          <p style={ps}>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. Material changes will be communicated through our website, app, or via other appropriate notification methods. Continued use of the platform after such changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <div style={divider} />

        {/* 13 */}
        <section>
          <h2 style={hs}>13. Consent</h2>
          <p style={ps}>
            By using our platform, you explicitly consent to the collection, processing, storage, and, where applicable, international transfer of your personal data — including sensitive identity documents — as described in this Privacy Policy.
          </p>
        </section>

        <div style={divider} />

        {/* 14 */}
        <section>
          <h2 style={hs}>14. Contact Us</h2>
          <p style={ps}>
            If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact our support team through the official channels listed on our website or mobile application.
          </p>
        </section>

        {/* Disclaimer */}
        <blockquote style={bq}>
          <p style={{ margin: 0, fontSize: "0.875rem", fontStyle: "italic", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
            This policy is provided for general informational purposes and does not constitute legal advice. Businesses should have this document reviewed by qualified legal counsel to ensure compliance with applicable data protection laws in their operating regions (e.g., GDPR, CCPA, or other regional regulations).
          </p>
        </blockquote>

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
  gap: "0.4rem",
};

const lis: React.CSSProperties = {
  fontSize: "0.9rem",
  lineHeight: 1.75,
  color: "var(--muted-foreground)",
};

const divider: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
  opacity: 0.45,
  marginTop: "-0.5rem",
};

const bq: React.CSSProperties = {
  margin: "0.5rem 0 0.5rem",
  padding: "1.2rem 1.5rem",
  borderLeft: "3px solid var(--primary)",
  background: "color-mix(in oklch, var(--primary) 7%, transparent)",
  borderRadius: "0 0.5rem 0.5rem 0",
};
