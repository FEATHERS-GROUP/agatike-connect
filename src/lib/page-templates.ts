export interface PageTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  themeColor: string;
  fontFamily: string;
  logoPosition: "hero" | "navbar";
  title: string;
  pageDescription: string;
  headerImageUrl: string;
  components: any[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "meeting-information",
    name: "Meeting Information",
    category: "Corporate",
    description: "A clean template for sharing meeting agendas, notes, and resources.",
    themeColor: "#0f172a",
    fontFamily: "Inter",
    logoPosition: "hero",
    title: "Weekly Sync",
    pageDescription: "Join us for our weekly team sync and updates.",
    headerImageUrl: "/page-templates/meeting-information.png",
    components: [
      {
        id: "1",
        type: "split_block",
        imagePosition: "left",
        imageUrl: "",
        text: "## Agenda\\n\\n1. Product Updates\\n2. Current Blockers\\n3. Next Steps & Action Items\\n\\nPlease review the attached documents before the meeting.",
      },
      {
        id: "2",
        type: "text",
        content: "### Resources\\n- Q3 Goals\\n- Product Roadmap\\n- Marketing Assets",
      },
    ],
  },
  {
    id: "conference-information",
    name: "Conference Information",
    category: "Events",
    description: "Detailed conference schedule, speaker lineup, and venue information.",
    themeColor: "#4338ca",
    fontFamily: "Outfit",
    logoPosition: "hero",
    title: "Annual Tech Conference 2026",
    pageDescription: "The premier event for technology professionals and innovators.",
    headerImageUrl: "/page-templates/conference-information.png",
    components: [
      {
        id: "1",
        type: "text",
        content: "## Welcome to ATC 2026\\nJoin thousands of industry leaders for three days of learning, networking, and inspiration.",
      },
      {
        id: "2",
        type: "split_block",
        imagePosition: "right",
        imageUrl: "",
        text: "## Keynote Speakers\\nWe are thrilled to announce our lineup of visionary speakers who are shaping the future of technology.",
      },
      {
        id: "3",
        type: "sponsor_logos",
        title: "Our Generous Sponsors",
        logos: [],
      },
      {
        id: "4",
        type: "button",
        label: "View Full Schedule",
        url: "#",
      },
    ],
  },
  {
    id: "event-registration",
    name: "Event Registration",
    category: "Events",
    description: "A conversion-optimized template for event sign-ups and ticket sales.",
    themeColor: "#e11d48",
    fontFamily: "Montserrat",
    logoPosition: "hero",
    title: "Register for the Event",
    pageDescription: "Secure your spot today before tickets run out.",
    headerImageUrl: "/page-templates/event-registration.png",
    components: [
      {
        id: "1",
        type: "form_grid",
        columns: "2",
        cardBgColor: "#ffffff",
        cardTextColor: "#000000",
        cards: [
          {
            id: "t1",
            formId: "",
            customTitle: "General Admission",
            buttonLabel: "Get Ticket",
            bulletPoints: "• Access to all main stages\\n• Networking sessions\\n• Lunch included",
          },
          {
            id: "t2",
            formId: "",
            customTitle: "VIP Pass",
            buttonLabel: "Get VIP Ticket",
            bulletPoints: "• Everything in General\\n• Exclusive VIP lounge\\n• Meet & Greet with speakers",
          },
        ],
      },
    ],
  },
  {
    id: "support-ticket",
    name: "Support Ticket Submission",
    category: "Customer Service",
    description: "A streamlined page for customers to submit help requests.",
    themeColor: "#0369a1",
    fontFamily: "Inter",
    logoPosition: "navbar",
    title: "How can we help?",
    pageDescription: "Submit a support ticket and our team will get back to you shortly.",
    headerImageUrl: "/page-templates/support-ticket.png",
    components: [
      {
        id: "1",
        type: "text",
        content: "Please provide as much detail as possible so we can assist you better. Include error messages, steps to reproduce, and your account information.",
      },
      {
        id: "2",
        type: "form_link",
        design: "card",
        content: "",
      },
    ],
  },
  {
    id: "feedback-form",
    name: "Feedback Form",
    category: "Customer Service",
    description: "Collect valuable feedback, surveys, and reviews from your audience.",
    themeColor: "#16a34a",
    fontFamily: "Lora",
    logoPosition: "hero",
    title: "We value your feedback",
    pageDescription: "Help us improve by sharing your thoughts and experience.",
    headerImageUrl: "/page-templates/feedback-form.png",
    components: [
      {
        id: "1",
        type: "text",
        content: "Your feedback is crucial in helping us enhance our products and services. The survey will only take 2 minutes to complete.",
      },
      {
        id: "2",
        type: "form_link",
        design: "button",
        content: "",
      },
    ],
  },
  {
    id: "employee-onboarding",
    name: "Employee Onboarding",
    category: "HR",
    description: "A centralized hub for new hires to complete necessary forms and training.",
    themeColor: "#5b21b6",
    fontFamily: "Inter",
    logoPosition: "hero",
    title: "Welcome to the Team!",
    pageDescription: "Your journey starts here. Please complete the following onboarding tasks.",
    headerImageUrl: "/page-templates/employee-onboarding.png",
    components: [
      {
        id: "1",
        type: "text",
        content: "## Getting Started\\nWelcome! We are excited to have you on board. Please follow the steps below to complete your onboarding process.",
      },
      {
        id: "2",
        type: "split_block",
        imagePosition: "left",
        imageUrl: "",
        text: "### Step 1: Equipment Setup\\nFollow the IT guide to set up your laptop, accounts, and access permissions.",
      },
      {
        id: "3",
        type: "form_link",
        design: "card",
        content: "",
      },
    ],
  },
  {
    id: "payment-collection",
    name: "Payment Collection",
    category: "Sales",
    description: "A secure and straightforward page for collecting payments or fees.",
    themeColor: "#059669",
    fontFamily: "Inter",
    logoPosition: "hero",
    title: "Complete Your Payment",
    pageDescription: "Secure payment processing for your outstanding balance or invoice.",
    headerImageUrl: "/page-templates/payment-collection.png",
    components: [
      {
        id: "1",
        type: "text",
        content: "All transactions are secure and encrypted. Please select your payment option below.",
      },
      {
        id: "2",
        type: "form_grid",
        columns: "1",
        cardBgColor: "#f8fafc",
        cardTextColor: "#0f172a",
        cards: [
          {
            id: "p1",
            formId: "",
            customTitle: "Invoice Payment",
            buttonLabel: "Pay Now",
            bulletPoints: "• Instant processing\\n• Receipt emailed automatically",
          },
        ],
      },
    ],
  },
  {
    id: "donation-page",
    name: "Donation Page",
    category: "Non-Profit",
    description: "Inspire giving with a dedicated page for charity and fundraising campaigns.",
    themeColor: "#d97706",
    fontFamily: "Playfair Display",
    logoPosition: "hero",
    title: "Support Our Cause",
    pageDescription: "Your contribution makes a difference in the lives of those we serve.",
    headerImageUrl: "/page-templates/donation-page.png",
    components: [
      {
        id: "1",
        type: "split_block",
        imagePosition: "right",
        imageUrl: "",
        text: "## Why Donate?\\nEvery dollar you give goes directly towards our community programs, helping us provide essential services to those in need.",
      },
      {
        id: "2",
        type: "form_grid",
        columns: "3",
        cardBgColor: "#ffffff",
        cardTextColor: "#000000",
        cards: [
          {
            id: "d1",
            formId: "",
            customTitle: "$25",
            buttonLabel: "Donate",
            bulletPoints: "Provides meals for a family for one week.",
          },
          {
            id: "d2",
            formId: "",
            customTitle: "$50",
            buttonLabel: "Donate",
            bulletPoints: "Sponsors a child's education materials.",
          },
          {
            id: "d3",
            formId: "",
            customTitle: "Custom Amount",
            buttonLabel: "Donate",
            bulletPoints: "Give whatever you can to support our mission.",
          },
        ],
      },
    ],
  },
  {
    id: "competition-registration",
    name: "Competition Registration",
    category: "Events",
    description: "Register participants for contests, hackathons, and tournaments.",
    themeColor: "#be185d",
    fontFamily: "Outfit",
    logoPosition: "hero",
    title: "Enter the Competition",
    pageDescription: "Showcase your skills and compete for amazing prizes.",
    headerImageUrl: "/page-templates/competition-registration.png",
    components: [
      {
        id: "1",
        type: "text",
        content: "## Rules & Guidelines\\n1. Teams must consist of 2-4 members.\\n2. All submissions must be original work.\\n3. Deadline for entry is Friday at 11:59 PM.",
      },
      {
        id: "2",
        type: "form_link",
        design: "card",
        content: "",
      },
      {
        id: "3",
        type: "sponsor_logos",
        title: "Prize Sponsors",
        logos: [],
      },
    ],
  },
  {
    id: "contact-form",
    name: "General Contact Form",
    category: "Business",
    description: "A simple and effective page for visitors to get in touch with you.",
    themeColor: "#1f2937",
    fontFamily: "Inter",
    logoPosition: "navbar",
    title: "Get in Touch",
    pageDescription: "Have a question? Drop us a line and we'll reply as soon as possible.",
    headerImageUrl: "/page-templates/contact-form.png",
    components: [
      {
        id: "1",
        type: "split_block",
        imagePosition: "left",
        imageUrl: "",
        text: "### Contact Details\\n\\n**Email**: hello@example.com\\n**Phone**: +1 (555) 123-4567\\n**Office**: 123 Business Ave, Suite 100",
      },
      {
        id: "2",
        type: "form_link",
        design: "card",
        content: "",
      },
    ],
  },
];
