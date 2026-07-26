import { createServerFn } from "@tanstack/react-start";

export const sendSMSServer = createServerFn({ method: "POST" })
  .validator((d: { to: string; text: string; organizerId?: string }) => d)
  .handler(async (ctx) => {
    const { sendSMS } = await import("./pindo.server");
    return await sendSMS(ctx.data.to, ctx.data.text, ctx.data.organizerId);
  });
