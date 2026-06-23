import { createAPIFileRoute } from '@tanstack/react-start/api';
import { handlePawaPayWebhook } from '@/api/pawapay.server';

export const APIRoute = createAPIFileRoute('/api/pawapay/payouts')({
  POST: async ({ request }) => {
    return handlePawaPayWebhook(request);
  },
});
