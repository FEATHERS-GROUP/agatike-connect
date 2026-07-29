export const EMAIL_TEMPLATES = [
  {
    label: "Initial Outreach",
    subject: "Thank You for Your Interest in Agatike Connect",
    message: (name: string) => `
      <p>Hi ${name},</p>

      <p>Thank you for your interest in <strong>Agatike Connect</strong>.</p>

      <p>
        We appreciate the opportunity to connect with you. We'd love to learn
        more about your business and discuss how our solutions can help you
        achieve your goals.
      </p>

      <p>
        Would you be available for a brief <strong>15–20 minute call</strong>
        this week? Simply reply to this email with a time that works best for you.
      </p>

      <p>We look forward to hearing from you.</p>

      <p>
        Kind regards,<br>
        <strong>Sales Team</strong><br>
        Agatike Connect
      </p>
    `
  },

  {
    label: "Follow-up",
    subject: "Following Up on Your Inquiry",
    message: (name: string) => `
      <p>Hi ${name},</p>

      <p>I hope you're doing well.</p>

      <p>
        I wanted to follow up regarding my previous email to see if you had any
        questions or needed additional information about Agatike Connect.
      </p>

      <p>
        We'd be happy to schedule a quick call to discuss your requirements and
        explore the best solution for your business.
      </p>

      <p>
        Looking forward to your response.
      </p>

      <p>
        Best regards,<br>
        <strong>Sales Team</strong><br>
        Agatike Connect
      </p>
    `
  },

  {
    label: "Proposal Sent",
    subject: "Your Proposal is Ready",
    message: (name: string) => `
      <p>Hi ${name},</p>

      <p>
        Thank you for taking the time to speak with us.
      </p>

      <p>
        Please find your proposal attached for review. If you have any questions
        or would like to discuss any aspect of the proposal, we'd be happy to help.
      </p>

      <p>
        We look forward to the opportunity to work with you.
      </p>

      <p>
        Sincerely,<br>
        <strong>Sales Team</strong><br>
        Agatike Connect
      </p>
    `
  },

  {
    label: "Closing Deal",
    subject: "Welcome to Agatike Connect",
    message: (name: string) => `
      <p>Hi ${name},</p>

      <p>
        We're excited to welcome you to Agatike Connect!
      </p>

      <p>
        Please review the attached agreement at your convenience. If everything
        looks good, simply sign and return it to begin the onboarding process.
      </p>

      <p>
        If you have any questions, we're always happy to assist.
      </p>

      <p>
        Welcome aboard—we look forward to working with you.
      </p>

      <p>
        Best regards,<br>
        <strong>Sales Team</strong><br>
        Agatike Connect
      </p>
    `
  }
];
