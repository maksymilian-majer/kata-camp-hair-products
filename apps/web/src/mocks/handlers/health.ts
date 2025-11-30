import { delay, http, HttpResponse } from 'msw';

import type { HealthResponse } from '@hair-product-scanner/shared';

export const healthHandlers = [
  http.get('*/api/health', async () => {
    await delay(100);
    const response: HealthResponse = { status: 'ok' };
    return HttpResponse.json(response);
  }),
];
