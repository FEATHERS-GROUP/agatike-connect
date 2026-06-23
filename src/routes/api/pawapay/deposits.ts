import { createAPIFileRoute } from '@tanstack/react-start/api';
import { handlePawaPayWebhook } from '@/api/pawapay.server';

export const APIRoute = createAPIFileRoute('/api/pawapay/deposits')({
  POST: async ({ request }) => {
    return handlePawaPayWebhook(request);
  },
});
