import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../mocks/server';
import { createQueryWrapper, renderHook, waitFor } from '../testing/test-utils';

import { useHealthCheck } from './use-health-check';

describe('useHealthCheck', () => {
  it('returns ok status when API is healthy', async () => {
    const { result } = renderHook(() => useHealthCheck(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ status: 'ok' });
  });

  it('returns error when API fails', async () => {
    server.use(
      http.get('*/api/health', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useHealthCheck(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('API unavailable');
  });
});
