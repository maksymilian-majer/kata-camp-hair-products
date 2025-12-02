import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggingMiddleware } from './logging.middleware';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: { statusCode: number; on: ReturnType<typeof vi.fn> };
  let mockNext: NextFunction;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    middleware = new LoggingMiddleware();

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/health',
    };

    mockResponse = {
      statusCode: 200,
      on: vi.fn(),
    };

    mockNext = vi.fn() as unknown as NextFunction;

    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(vi.fn());
  });

  it('should call next()', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it('should register close event listener on response', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    expect(mockResponse.on).toHaveBeenCalledWith('close', expect.any(Function));
  });

  it('should log request details on successful response', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    const closeHandler = mockResponse.on.mock.calls[0][1] as () => void;
    closeHandler();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/health 200 \d+ms/)
    );
  });

  it('should log request details on error response', () => {
    mockResponse.statusCode = 500;

    middleware.use(
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    const closeHandler = mockResponse.on.mock.calls[0][1] as () => void;
    closeHandler();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/health 500 \d+ms/)
    );
  });

  it('should log POST requests correctly', () => {
    mockRequest.method = 'POST';
    mockRequest.originalUrl = '/api/auth/login';
    mockResponse.statusCode = 201;

    middleware.use(
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    const closeHandler = mockResponse.on.mock.calls[0][1] as () => void;
    closeHandler();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/POST \/api\/auth\/login 201 \d+ms/)
    );
  });

  it('should measure response duration', async () => {
    vi.useFakeTimers();

    middleware.use(
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    vi.advanceTimersByTime(50);

    const closeHandler = mockResponse.on.mock.calls[0][1] as () => void;
    closeHandler();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/health 200 50ms/)
    );

    vi.useRealTimers();
  });
});
