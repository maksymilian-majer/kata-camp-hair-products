import { http, HttpResponse } from 'msw';

export const healthHandlers = [
  http.get('*/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
