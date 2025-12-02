import type { ArgumentsHost } from '@nestjs/common';
import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let mockHost: ArgumentsHost;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = new HttpExceptionFilter();

    mockRequest = {
      method: 'POST',
      url: '/api/auth/login',
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest as Request,
        getResponse: () => mockResponse as unknown as Response,
      }),
    } as ArgumentsHost;

    errorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(vi.fn());
  });

  it('should log 5xx errors with error level and stack trace', () => {
    const exception = new InternalServerErrorException('Database error');

    filter.catch(exception, mockHost);

    expect(errorSpy).toHaveBeenCalledWith(
      'POST /api/auth/login - Database error',
      expect.stringContaining('InternalServerErrorException')
    );
  });

  it('should NOT log 4xx errors', () => {
    const exception = new BadRequestException('Invalid input');

    filter.catch(exception, mockHost);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should NOT log 404 errors', () => {
    const exception = new NotFoundException('User not found');

    filter.catch(exception, mockHost);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should log unknown errors as 500 with full stack', () => {
    const exception = new Error('Connection refused');

    filter.catch(exception, mockHost);

    expect(errorSpy).toHaveBeenCalledWith(
      'POST /api/auth/login - Internal server error',
      expect.stringContaining('Connection refused')
    );
  });

  it('should include request context in log', () => {
    mockRequest.method = 'GET';
    mockRequest.url = '/api/users/123';
    const exception = new InternalServerErrorException('Server error');

    filter.catch(exception, mockHost);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/users/123'),
      expect.any(String)
    );
  });

  it('should respond with 500 status for unknown errors', () => {
    const exception = new Error('Unknown error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/api/auth/login',
      })
    );
  });

  it('should respond with correct status for HttpExceptions', () => {
    const exception = new BadRequestException('Validation failed');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
      })
    );
  });

  it('should include timestamp in response', () => {
    const exception = new BadRequestException('Invalid');

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      })
    );
  });
});
