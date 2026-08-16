import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/pesapal/callback")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const referenceId = url.searchParams.get("reference_id");
    const type = url.searchParams.get("type");

    let redirectPath = "/";

    if (type?.includes("checkout") || type?.includes("event_ticket")) {
      redirectPath = `/d/${referenceId}`; // The public booking/order status page
    } else if (type === "subscription") {
      redirectPath = "/dashboard/billing/subscriptions";
    }

    return new Response(null, {
      status: 302,
      headers: { Location: redirectPath },
    });
  },
});
