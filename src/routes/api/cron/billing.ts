import { createAPIFileRoute } from "@tanstack/react-start/api";
import { runBillingCron } from "@/api/billing.server";

export const APIRoute = createAPIFileRoute("/api/cron/billing")({
  POST: async () => {
    try {
      const result = await runBillingCron();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
});
