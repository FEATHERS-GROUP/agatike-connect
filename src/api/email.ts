import { createServerFn } from "@tanstack/react-start";

export const sendAttendeeEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendAttendeeEmailRaw } = await import("./email.server");
    return sendAttendeeEmailRaw(ctx);
  });

export const sendTicketsEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendTicketsEmailRaw } = await import("./email.server");
    return sendTicketsEmailRaw(ctx);
  });

export const sendProfileUpdateOTP = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendProfileUpdateOTPRaw } = await import("./email.server");
    return sendProfileUpdateOTPRaw(ctx);
  });

export const sendSubscriptionConfirmationEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendSubscriptionConfirmationEmailRaw } = await import("./email.server");
    return sendSubscriptionConfirmationEmailRaw(ctx);
  });

export const sendSubscriptionInvoiceEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendSubscriptionInvoiceEmailRaw } = await import("./email.server");
    return sendSubscriptionInvoiceEmailRaw(ctx);
  });

export const sendCompanyRosterEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendCompanyRosterEmailRaw } = await import("./email.server");
    return sendCompanyRosterEmailRaw(ctx);
  });

export const sendMemberWelcomeEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendMemberWelcomeEmailRaw } = await import("./email.server");
    return sendMemberWelcomeEmailRaw(ctx);
  });

export const sendVisitorPassEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendVisitorPassEmailRaw } = await import("./email.server");
    return sendVisitorPassEmailRaw(ctx);
  });

export const sendWorkspaceUserInviteEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendWorkspaceUserInviteEmailRaw } = await import("./email.server");
    return sendWorkspaceUserInviteEmailRaw(ctx);
  });

export const sendVenueBookingEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendVenueBookingEmailRaw } = await import("./email.server");
    return sendVenueBookingEmailRaw(ctx);
  });

export const sendTrialExtensionEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendTrialExtensionEmailRaw } = await import("./email.server");
    return sendTrialExtensionEmailRaw(ctx);
  });

export const sendDigitalProductDeliveryEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendDigitalProductDeliveryEmailRaw } = await import("./email.server");
    return sendDigitalProductDeliveryEmailRaw(ctx);
  });

export const sendSupportTicketResolvedEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { sendSupportTicketResolvedEmailRaw } = await import("./email.server");
    return sendSupportTicketResolvedEmailRaw(ctx);
  });

