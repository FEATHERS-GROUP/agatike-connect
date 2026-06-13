import React from "react";

export function PrivacyPolicy() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
      <h2 className="text-2xl font-bold text-foreground mb-6">PRIVACY POLICY</h2>

      <p>
        We respect your privacy and are committed to protecting your personal data in accordance
        with applicable international data protection laws. When you use our platform, we may
        collect personal information including your name, email address, phone number, profile
        details, location data (where applicable), device information, usage activity, and any
        information necessary to provide our services.
      </p>

      <p>
        In addition, for security, identity verification, fraud prevention, and compliance purposes,
        we may collect and process sensitive identity information such as government-issued
        identification documents, including national identity cards, passports, driving licenses,
        and other official identification documents. This information may be used for user
        verification (KYC – Know Your Customer), access control to secure facilities, prevention of
        unauthorized access, and compliance with legal or regulatory obligations.
      </p>

      <p>
        We do not sell your personal data. We may share limited personal information, including
        identity verification data where strictly necessary, with trusted third-party service
        providers who assist in operating the platform. These may include identity verification
        providers, payment processors, cloud storage providers, security services, and event or
        facility operators. All third parties are contractually required to handle your data
        securely, confidentially, and only for the purposes we specify.
      </p>

      <p>
        We implement strong technical, administrative, and organizational security measures to
        protect your data, including encrypted storage and restricted access controls, particularly
        for sensitive identity documents. However, no system can be guaranteed 100% secure, and you
        acknowledge that you use the platform at your own risk.
      </p>

      <p>
        Depending on your jurisdiction, you may have rights over your personal data, including the
        right to access, correct, update, or request deletion of your information, subject to legal
        and security retention requirements. Identity verification data may be retained for as long
        as necessary to comply with legal obligations, prevent fraud, and maintain platform
        security.
      </p>

      <p>
        By using our platform, you explicitly consent to the collection, processing, and storage of
        your personal data, including sensitive identity documents, as described in this Privacy
        Policy. You also acknowledge that your information may be transferred and stored in
        countries outside your place of residence where necessary for service operation, subject to
        appropriate safeguards.
      </p>

      <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">
        KYC (KNOW YOUR CUSTOMER) & IDENTITY VERIFICATION POLICY
      </h3>

      <p>
        To ensure the security of our platform, prevent fraud, and comply with legal and regulatory
        obligations, we may require users to complete identity verification procedures (“KYC – Know
        Your Customer”).
      </p>

      <p>
        As part of this process, we may collect and verify government-issued identification
        documents, including but not limited to national identity cards, passports, driver’s
        licenses, and other official documents. We may also request additional information such as a
        selfie or biometric verification to confirm that the identity provided belongs to the
        account holder.
      </p>

      <p>The purpose of identity verification includes:</p>
      <ul className="list-disc pl-5 my-2">
        <li>Preventing fraud, impersonation, and unauthorized access</li>
        <li>Securing office access and controlled facilities</li>
        <li>Ensuring authenticity of ticket buyers, sellers, and organizers</li>
        <li>Complying with applicable legal, regulatory, and security requirements</li>
        <li>Maintaining the integrity and safety of the platform community</li>
      </ul>

      <p>
        Users agree that all submitted identity information is accurate, valid, and belongs to them.
        Submission of false, forged, or altered documents is strictly prohibited and may result in
        immediate account suspension or permanent termination.
      </p>

      <p>
        We may use trusted third-party verification service providers to assist in verifying
        identity documents. These providers are contractually required to handle your data securely
        and only for verification purposes.
      </p>

      <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">DATA RETENTION POLICY</h3>

      <p>
        We retain personal data only for as long as necessary to fulfill the purposes for which it
        was collected, including providing services, complying with legal obligations, resolving
        disputes, enforcing agreements, and ensuring platform security.
      </p>

      <p>
        Identity verification data (including passports, national IDs, and related documents) may be
        retained for a limited period even after account closure, where required for fraud
        prevention, legal compliance, or security purposes. The exact retention period may vary
        depending on applicable laws and regulatory requirements in different jurisdictions.
      </p>

      <p>
        When personal data is no longer required, we will take reasonable steps to securely delete,
        anonymize, or irreversibly destroy it in accordance with industry security standards.
      </p>

      <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">
        DATA DELETION POLICY (RIGHT TO BE FORGOTTEN)
      </h3>

      <p>
        Users may request deletion of their personal data at any time by contacting our support team
        or using account deletion tools within the platform.
      </p>

      <p>Upon receiving a valid deletion request, we will:</p>
      <ul className="list-disc pl-5 my-2">
        <li>Delete or anonymize personal profile data where legally permissible</li>
        <li>Remove access to the user account</li>
        <li>Delete stored content such as posts, messages, and profile information</li>
      </ul>

      <p>However, certain data may be retained where necessary, including:</p>
      <ul className="list-disc pl-5 my-2">
        <li>Identity verification data required for legal compliance or fraud prevention</li>
        <li>Transaction records required for financial auditing or dispute resolution</li>
        <li>Data required to comply with applicable laws or enforce legal rights</li>
      </ul>

      <p>
        Once data is deleted, recovery will not be possible. Users acknowledge that deletion may
        result in permanent loss of access to their account and associated data.
      </p>

      <p className="mt-8 font-semibold italic text-foreground">
        “I agree to provide valid government-issued identification for verification purposes.”
      </p>
    </div>
  );
}
