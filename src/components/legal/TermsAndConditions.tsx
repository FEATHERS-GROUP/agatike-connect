import React from "react";

export function TermsAndConditions() {
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

        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, margin: "0 0 0.75rem", color: "var(--foreground)" }}>
          Terms and Conditions of Use
        </h1>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Last Updated:</strong> June 2026
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Effective Date:</strong> June 2026
          </span>
        </div>

        <div style={{ height: "1px", background: "var(--border)", opacity: 0.55 }} />
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>

        {/* 1 */}
        <section>
          <h2 style={hs}>1. Introduction</h2>
          <p style={ps}>
            Welcome to Agatike Connect ("we," "our," "us," or the "Company"). These Terms and Conditions ("Terms") constitute a legally binding agreement governing your access to and use of our mobile application, website, software, and related services (collectively, the "Platform").
          </p>
          <p style={ps}>Our Platform provides services including, but not limited to:</p>
          <ul style={ls}>
            {[
              "Event ticketing and management",
              "Office and facility access management",
              "Social networking and user interaction features",
              "Messaging, content sharing, and community engagement tools",
              "Venue and space listings",
              "Merchandise and product sales",
              "Page builder tools for hosts, organizers, and businesses",
              "Space and venue management tools",
              "Activities and experience management"
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy and Refund Policy, which are incorporated herein by reference. If you do not agree to these Terms, you must not access or use the Platform.
          </p>
        </section>

        <div style={divider} />

        {/* 2 */}
        <section>
          <h2 style={hs}>2. Eligibility</h2>
          <p style={ps}>To access or use the Platform, you must:</p>
          <ul style={ls}>
            {[
              "Be at least 18 years old, or the age of legal majority in your jurisdiction, whichever is greater",
              "Have the legal capacity to enter into a binding agreement",
              "Not be barred from using the Platform under the laws of your jurisdiction or any applicable trade, export, or sanctions regulations",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            We reserve the right to refuse, suspend, or terminate access to the Platform for any individual or entity, at our sole discretion, with or without notice.
          </p>
        </section>

        <div style={divider} />

        {/* 3 */}
        <section>
          <h2 style={hs}>3. Account Registration</h2>
          <p style={ps}>Certain features of the Platform require you to create an account. When registering, you agree to:</p>
          <ul style={ls}>
            {[
              "Provide accurate, current, and complete information",
              "Maintain and promptly update your account information as needed",
              "Maintain the confidentiality of your login credentials, including passwords and verification codes",
              "Accept full responsibility for all activities that occur under your account",
              "Notify us immediately at our official support channels of any unauthorized access, suspected breach, or security concern related to your account",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            We are not liable for any loss or damage arising from your failure to safeguard your account credentials or from unauthorized use of your account, except where such loss results directly from our own gross negligence or willful misconduct.
          </p>
          <p style={ps}>
            Certain features — such as listing a venue, space, or office for rent, creating events, or selling merchandise — may require you to register as a Host, Venue Owner, or Organizer account, which is subject to additional terms set out in Section 5 below.
          </p>
        </section>

        <div style={divider} />

        {/* 4 */}
        <section>
          <h2 style={hs}>4. Platform Services</h2>

          <h3 style={shs}>4.1 Ticketing Services</h3>
          <p style={ps}>The Platform enables users to:</p>
          <ul style={ls}>
            {["Purchase, sell, or distribute tickets for events","Verify ticket authenticity through our systems","Manage event attendance, reservations, and related transactions"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Events listed on the Platform are created and managed by independent third-party organizers. We are not responsible for event cancellations, postponements, changes in event details, or any misconduct on the part of an organizer. Refund matters relating to cancelled or rescheduled events are governed separately by our Refund Policy.
          </p>

          <h3 style={shs}>4.2 Office and Facility Access Services</h3>
          <p style={ps}>Where applicable, the Platform may provide:</p>
          <ul style={ls}>
            {["Digital access credentials (e.g., QR codes, NFC tags, or similar technology)","Entry management systems for buildings, offices, or other facilities"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>When using access services, you agree not to:</p>
          <ul style={ls}>
            {["Share access credentials with unauthorized individuals","Tamper with, duplicate, circumvent, or attempt to reverse-engineer access systems","Use access privileges for any purpose other than their intended use"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Violation of this section may result in immediate suspension of access privileges, account termination, and — where applicable — referral to relevant facility owners or law enforcement authorities.
          </p>

          <h3 style={shs}>4.3 Social Networking Features</h3>
          <p style={ps}>The Platform may include:</p>
          <ul style={ls}>
            {["User profiles","Messaging systems","Posts, comments, and media sharing tools","Community interaction features"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            You acknowledge that content you post may be visible to other users depending on your privacy settings, and that we cannot guarantee the confidentiality of information you choose to share publicly or with other users.
          </p>
          
          <h3 style={shs}>4.4 Venue Listings, Space &amp; Facility Rentals</h3>
          <p style={ps}>
            The Platform allows Hosts, Venue Owners, and Organizers to list venues, offices, private rooms, gyms, studios, and other spaces or facilities ("Listed Spaces") for rental, booking, or event use by other users. Detailed obligations for those listing and renting out spaces are set out in Section 5 (Host, Venue Owner &amp; Organizer Terms) below.
          </p>
          <p style={ps}>
            We act solely as a platform connecting users with Hosts and Venue Owners. We are not the owner, lessor, or operator of any Listed Space and are not a party to any rental, lease, or booking agreement formed between a user and a Host or Venue Owner.
          </p>

          <h3 style={shs}>4.5 Merchandise and Product Sales</h3>
          <p style={ps}>
            The Platform may allow Hosts, Organizers, or approved sellers to list and sell merchandise, event-related products, or other goods ("Merchandise") to users. Unless otherwise stated, Merchandise is sold directly by the relevant seller, and:
          </p>
          <ul style={ls}>
            {[
              "Product descriptions, pricing, and availability are the responsibility of the seller",
              "Quality, condition, and fulfillment (including shipping and delivery) of Merchandise are the seller's responsibility",
              "We are not responsible for defective, misrepresented, undelivered, or delayed Merchandise, though we may assist in facilitating communication between buyers and sellers"
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>4.6 Page Builder Tools</h3>
          <p style={ps}>
            The Platform provides page builder tools that allow Hosts, Organizers, and businesses to create customized pages to promote their events, venues, spaces, activities, or Merchandise. You are solely responsible for the accuracy, legality, and appropriateness of any content published through these tools, and such content remains subject to Section 6 (User Content) and Section 7 (Prohibited Activities) of these Terms.
          </p>

          <h3 style={shs}>4.7 Activities and Experience Management</h3>
          <p style={ps}>
            The Platform enables Hosts and Organizers to list, manage, and sell bookings for activities and experiences (e.g., classes, tours, workshops, recreational sessions). As with events and venue listings, we are not responsible for the conduct, quality, safety, or delivery of any activity or experience offered by a Host or Organizer, though we may require Hosts to meet certain listing standards as described in Section 5.
          </p>
        </section>

        <div style={divider} />

        {/* 5 */}
        <section>
          <h2 style={hs}>5. Host, Venue Owner &amp; Organizer Terms</h2>
          <p style={ps}>
            This section applies to any user who lists, advertises, rents out, or otherwise makes available a venue, office, space (including gyms, private offices, studios, or similar facilities), event, activity, experience, or Merchandise through the Platform (each, a "Host," "Venue Owner," or "Organizer," collectively "Hosts").
          </p>

          <h3 style={shs}>5.1 Role of the Platform</h3>
          <p style={ps}>
            We provide the technology that allows Hosts to list and manage their venues, spaces, offices, events, activities, and Merchandise, and that allows users to discover and book them. We are not a party to, and do not guarantee the performance of, any agreement formed between a Host and a user (including bookings, rentals, ticket sales, or purchases). Any such agreement is strictly between the Host and the user.
          </p>

          <h3 style={shs}>5.2 Host Responsibilities</h3>
          <p style={ps}>By listing a venue, space, office, event, activity, or Merchandise on the Platform, a Host represents, warrants, and agrees that:</p>
          <ul style={ls}>
            {[
              "They have full legal right, title, authority, or landlord/owner permission to list and rent out, or otherwise make available, the relevant venue, space, office, or facility",
              "All information provided in a listing (including descriptions, photos, pricing, availability, capacity, and rules) is accurate, current, and not misleading",
              "They will comply with all applicable laws, zoning regulations, health and safety codes, licensing requirements, tax obligations, and insurance requirements relevant to their venue, space, office, activity, or Merchandise",
              "They are solely responsible for the condition, safety, cleanliness, and legal compliance of any venue, space, or office they list",
              "They will honor confirmed bookings, reservations, and ticket sales made through the Platform, except where a cancellation or change is made in accordance with our Refund Policy",
              "They will not use the Platform to list a venue, space, office, event, or activity for any unlawful purpose"
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>5.3 Payouts and Fees</h3>
          <ul style={ls}>
            {[
              "Hosts will receive payment for confirmed bookings, ticket sales, or Merchandise sales, less any applicable platform fees, service charges, or taxes, in accordance with the payout schedule and method made available to them through the Platform",
              "We reserve the right to withhold, delay, or hold in reserve funds owed to a Host where necessary to investigate a dispute, complaint, suspected fraud, cancellation, or as otherwise described in our Refund Policy",
              "Hosts are solely responsible for determining and remitting any taxes owed on income earned through the Platform"
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>5.4 Cancellations, Closures &amp; Disputes</h3>
          <ul style={ls}>
            {[
              "Where a Host cancels an event, activity, or booking, or where a venue, space, or office is permanently closed or becomes unavailable, the Host is responsible for resolving refund and compensation matters directly with affected users, as set out in our Refund Policy",
              "We may, at our discretion, hold or block unpaid funds owed to a Host pending resolution of a cancellation, closure, or dispute, but we are not obligated to refund users directly on a Host's behalf",
              "Repeated cancellations, unresolved user complaints, or evidence of misconduct may result in suspension or removal of a Host's listings or account, in addition to any other remedies available to us under these Terms"
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>

          <h3 style={shs}>5.5 Independent Contractor Relationship</h3>
          <p style={ps}>
            Hosts, Venue Owners, and Organizers are independent third parties and are not employees, agents, partners, or representatives of Agatike Connect. Nothing in these Terms creates an employment, agency, partnership, or joint-venture relationship between us and any Host.
          </p>

          <h3 style={shs}>5.6 Host Indemnification</h3>
          <p style={ps}>
            In addition to the general indemnification obligations in Section 17, Hosts agree to indemnify and hold us harmless from any claims, damages, or liabilities arising from their venue, space, office, event, activity, or Merchandise listing, including claims relating to property damage, personal injury, licensing failures, or misrepresentation of a listing.
          </p>
        </section>

        <div style={divider} />

        {/* 6 */}
        <section>
          <h2 style={hs}>6. User Content</h2>
          <p style={ps}>
            You retain ownership of any content you upload, post, transmit, or otherwise make available through the Platform ("User Content").
          </p>
          <p style={ps}>By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, transferable, sub-licensable license to use, host, store, reproduce, display, distribute, adapt, and create derivative works from your User Content, solely for the purposes of operating, promoting, and improving the Platform.</p>

          <h3 style={shs}>6.1 Content Standards</h3>
          <p style={ps}>You represent and warrant that your User Content will not:</p>
          <ul style={ls}>
            {[
              "Violate any applicable law or regulation",
              "Infringe upon the intellectual property, privacy, or other rights of any third party",
              "Contain hate speech, threats, violence, or harassment",
              "Include fraudulent, deceptive, or misleading information",
              "Contain viruses, malware, or other harmful or disruptive code",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            We reserve the right, but not the obligation, to review, monitor, and remove any User Content, at our sole discretion, at any time and without prior notice, including content that we believe violates these Terms or is otherwise objectionable.
          </p>
        </section>

        <div style={divider} />

        {/* 7 */}
        <section>
          <h2 style={hs}>7. Prohibited Activities</h2>
          <p style={ps}>When using the Platform, you agree that you will not:</p>
          <ul style={ls}>
            {[
              "Use the Platform for any unlawful purpose or in violation of any applicable law",
              "Impersonate any person or entity, or misrepresent your identity or affiliation",
              "Hack, disrupt, interfere with, or attempt to compromise the security or integrity of the Platform",
              "Scrape, harvest, or extract data from the Platform without our prior written permission",
              "Sell, rent, lease, or otherwise transfer your account to another party",
              "Abuse ticketing systems, access systems, or promotional offers, including through automated means (bots)",
              "Post spam, scams, phishing content, or other misleading material",
              "List a venue, space, office, event, activity, or Merchandise that you do not have the legal right or authority to offer",
              "Engage in any activity that could damage, disable, or impair the Platform or interfere with any other user's access",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Violation of this section may result in content removal, account suspension, permanent termination, forfeiture of associated credits or benefits, and — where applicable — referral to law enforcement authorities.
          </p>
        </section>

        <div style={divider} />

        {/* 8 */}
        <section>
          <h2 style={hs}>8. Payments and Fees</h2>
          <p style={ps}>Certain features of the Platform require payment. By making a purchase, you agree that:</p>
          <ul style={ls}>
            {[
              "All payments are final unless otherwise expressly stated at the time of purchase or required by our Refund Policy",
              "Prices for tickets, bookings, Merchandise, and other services are subject to change at any time without prior notice",
              "Applicable taxes, duties, or levies may be added to your purchase depending on your jurisdiction",
              "Payment processing may be conducted by third-party payment providers, and your use of such services is also subject to their respective terms and privacy policies",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            We are not responsible for errors, delays, or failures caused by third-party payment processors, banks, or card issuers.
          </p>
        </section>

        <div style={divider} />

        {/* 9 */}
        <section>
          <h2 style={hs}>9. Refunds and Cancellations</h2>
          <p style={ps}>Refund eligibility depends on:</p>
          <ul style={ls}>
            {["The policies set by the relevant Host, event organizer, or venue owner","The type of ticket, booking, product, or service purchased","Applicable local consumer protection laws"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            We do not guarantee refunds unless explicitly stated in our Refund Policy or required by law. Where an event is cancelled, a booking is cancelled, or a venue/facility is permanently closed, resolution and refund arrangements are the responsibility of the relevant organizer, host, or venue owner, as detailed in our Refund Policy.
          </p>
          <p style={ps}>
            For office access subscriptions or other digital services, refunds may be issued only in cases of verified system failure or confirmed billing errors on our part.
          </p>
          <p style={ps}>
            Full details, timelines, and procedures for requesting a refund are set out in our Refund Policy, which forms part of these Terms.
          </p>
        </section>

        <div style={divider} />

        {/* 10 */}
        <section>
          <h2 style={hs}>10. Privacy Policy</h2>
          <p style={ps}>
            Your use of the Platform is also governed by our Privacy Policy, which explains in detail how we collect, use, share, retain, and protect your personal data, including identity verification (KYC) information where applicable.
          </p>
          <p style={ps}>
            We are committed to complying with applicable international privacy and data protection principles, including GDPR-aligned practices where applicable to our operations and users. By using the Platform, you consent to the data practices described in our Privacy Policy.
          </p>
        </section>

        <div style={divider} />

        {/* 11 */}
        <section>
          <h2 style={hs}>11. Security</h2>
          <p style={ps}>
            We implement reasonable technical, administrative, and organizational security measures designed to protect the Platform and your data. However:
          </p>
          <ul style={ls}>
            {["No system, network, or method of data transmission is completely secure","You use the Platform at your own risk","You are solely responsible for maintaining the security of your account, devices, and credentials used to access the Platform"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            We encourage you to use strong, unique passwords and to enable any additional security features we make available.
          </p>
        </section>

        <div style={divider} />

        {/* 12 */}
        <section>
          <h2 style={hs}>12. Termination</h2>
          <p style={ps}>
            We may suspend or terminate your account and access to the Platform, with or without prior notice, if:
          </p>
          <ul style={ls}>
            {[
              "You violate these Terms or any incorporated policy",
              "You engage in fraudulent, abusive, or illegal activity",
              "We are required to do so by law, court order, or a directive from a competent legal or regulatory authority",
              "We discontinue the Platform or a specific service, in whole or in part",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            You may delete your account at any time through the account settings or by contacting our support team. Upon termination, your right to use the Platform will immediately cease, though certain provisions of these Terms (including but not limited to Sections 13, 15, 17, and 19) will survive termination.
          </p>
        </section>

        <div style={divider} />

        {/* 13 */}
        <section>
          <h2 style={hs}>13. Intellectual Property</h2>
          <p style={ps}>
            All content on the Platform — excluding User Content — including but not limited to:
          </p>
          <ul style={ls}>
            {["Logos and trademarks","Software and source code","Design elements and user interface","Features and functionality","Branding materials"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            is the exclusive property of Agatike Connect or its licensors and is protected by applicable intellectual property laws, including copyright and trademark law.
          </p>
          <p style={ps}>
            You may not copy, reproduce, modify, distribute, publicly display, or create derivative works from any Platform materials without our prior written permission. Unauthorized use may result in legal action.
          </p>
        </section>

        <div style={divider} />

        {/* 14 */}
        <section>
          <h2 style={hs}>14. Third-Party Services</h2>
          <p style={ps}>The Platform may integrate or link to third-party services, including but not limited to:</p>
          <ul style={ls}>
            {["Payment processors","Identity verification providers","Independent event organizers, hosts, and venue owners","Analytics and performance-monitoring tools"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            These third-party services operate independently of us and are governed by their own terms and privacy policies. We are not responsible for the content, accuracy, availability, or conduct of any third-party service, and your interactions with such third parties are solely between you and them.
          </p>
        </section>

        <div style={divider} />

        {/* 15 */}
        <section>
          <h2 style={hs}>15. Limitation of Liability</h2>
          <p style={ps}>To the maximum extent permitted by applicable law:</p>
          <ul style={ls}>
            {[
              "We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform",
              "We shall not be responsible for any loss of data, revenue, profits, or business opportunities",
              "We shall not be responsible for the actions, omissions, or misconduct of users, event organizers, Hosts, Venue Owners, or third-party service providers",
              "Our total aggregate liability arising out of or related to your use of the Platform shall not exceed the total amount you paid to us in the twelve (12) months preceding the event giving rise to the claim",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
          </p>
        </section>

        <div style={divider} />

        {/* 16 */}
        <section>
          <h2 style={hs}>16. Disclaimer of Warranties</h2>
          <p style={ps}>
            The Platform is provided on an "as is" and "as available" basis, without warranties of any kind, whether express or implied. To the fullest extent permitted by law, we disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p style={ps}>We make no warranty that:</p>
          <ul style={ls}>
            {[
              "The Platform will be error-free or uninterrupted",
              "Defects will be corrected",
              "The Platform or its servers are free of harmful components",
              "Content available through the Platform will always be accurate, complete, or current",
              "Any venue, space, office, event, activity, or Merchandise listed by a Host meets a particular standard of quality, safety, or legality"
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
        </section>

        <div style={divider} />

        {/* 17 */}
        <section>
          <h2 style={hs}>17. Indemnification</h2>
          <p style={ps}>
            You agree to indemnify, defend, and hold harmless Agatike Connect, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:
          </p>
          <ul style={ls}>
            {["Your use or misuse of the Platform","Your violation of these Terms","Your violation of any applicable law or the rights of any third party"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
        </section>

        <div style={divider} />

        {/* 18 */}
        <section>
          <h2 style={hs}>18. International Use</h2>
          <p style={ps}>
            The Platform is intended for global use. If you access the Platform from outside Rwanda, you do so on your own initiative and are solely responsible for compliance with the laws applicable in your jurisdiction.
          </p>
          <p style={ps}>
            We make no representation that the Platform, or any content available through it, is appropriate, legal, or available for use in every country or region.
          </p>
        </section>

        <div style={divider} />

        {/* 19 */}
        <section>
          <h2 style={hs}>19. Governing Law and Dispute Resolution</h2>
          <p style={ps}>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of Rwanda, without regard to conflict-of-law principles.
          </p>
          <p style={ps}>In the event of a dispute arising out of or relating to these Terms or the Platform, the parties agree to attempt resolution in the following order:</p>
          <ol style={{ ...ls, listStyle: "decimal" }}>
            {[
              "Good-faith negotiation between the parties",
              "Mediation or arbitration, which shall be the preferred method of formal dispute resolution",
              "Courts of competent jurisdiction in Rwanda, where negotiation or arbitration does not resolve the dispute",
            ].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ol>
        </section>

        <div style={divider} />

        {/* 20 */}
        <section>
          <h2 style={hs}>20. Changes to These Terms</h2>
          <p style={ps}>
            We reserve the right to modify, amend, or update these Terms at any time, at our sole discretion. When we make material changes, we will:
          </p>
          <ul style={ls}>
            {["Post the updated Terms within the app or on our website","Update the \"Last Updated\" date at the top of this document"].map((x,i)=><li key={i} style={lis}>{x}</li>)}
          </ul>
          <p style={ps}>
            Your continued use of the Platform following the posting of updated Terms constitutes your acceptance of those changes. If you do not agree to the revised Terms, you must discontinue use of the Platform.
          </p>
        </section>

        <div style={divider} />

        {/* 21 */}
        <section>
          <h2 style={hs}>21. Contact Information</h2>
          <p style={ps}>For questions, concerns, or legal inquiries regarding these Terms, please contact us at:</p>
          <ul style={{ ...ls, listStyle: "none", paddingLeft: 0 }}>
            <li style={lis}><strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Email:</strong> hello@agatike.rw</li>
            <li style={lis}><strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Company Address:</strong> Kigali, Rwanda</li>
          </ul>
        </section>

        {/* Disclaimer */}
        <blockquote style={bq}>
          <p style={{ margin: 0, fontSize: "0.875rem", fontStyle: "italic", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
            This document is provided for general informational purposes and does not constitute legal advice. We recommend that this document be reviewed by qualified legal counsel to ensure full compliance with applicable laws in all jurisdictions where the Platform operates.
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
