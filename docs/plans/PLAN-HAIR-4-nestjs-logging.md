# Implementation Plan: NestJS Logging Infrastructure

**Story**: HAIR-4
**Created**: 2025-12-02

## Overview

This is a backend-only infrastructure task to add comprehensive logging to the NestJS API. Currently, when database errors occur (e.g., killing the database during a login attempt), users see a 500 error but no logs appear in the console. This plan implements:

1. HTTP request logging middleware
2. Global exception filter with error logging
3. Proper logger configuration

## Current State Analysis

- `main.ts` uses `Logger` from `@nestjs/common` but only for startup message
- No request logging middleware exists
- No exception filter exists - errors are swallowed silently
- `AuthController.mapError()` catches exceptions and converts to HTTP exceptions but doesn't log
- Database errors in repository layer bubble up unlogged

## What Needs to Be Logged

| Event Type                                     | Current       | Target  |
| ---------------------------------------------- | ------------- | ------- |
| Application startup                            | ✅ Logged     | ✅ Keep |
| HTTP requests (method, path, status, duration) | ❌ Not logged | ✅ Add  |
| Uncaught exceptions (stack trace)              | ❌ Not logged | ✅ Add  |
| Database connection errors                     | ❌ Not logged | ✅ Add  |

---

## Approach

This is an infrastructure task that doesn't follow the standard 7-phase feature development pattern. The existing subagents (`backend-phase-4`, `backend-phase-5`, `backend-phase-6`) are designed for repository → service → controller TDD workflows.

For this cross-cutting infrastructure task, we'll implement directly without subagents, using a simplified single-phase approach with TDD.

---

## Implementation Tasks

### 1. HTTP Request Logging Middleware

**Testing**: Write tests FIRST (Unit tests with mocked logger)

#### Tasks

- [ ] Write middleware unit tests FIRST
- [ ] Create `LoggingMiddleware` class in `apps/api/src/shared/middleware/`
- [ ] Log: HTTP method, URL, status code, response time
- [ ] Apply middleware globally in `AppModule`

#### Test Scenarios (Write BEFORE Implementation)

```typescript
// apps/api/src/shared/middleware/logging.middleware.spec.ts
describe('LoggingMiddleware', () => {
  it('should log request details on successful response', async () => {
    // Given: a middleware instance with mocked logger
    // When: request completes successfully
    // Then: logger.log() is called with method, path, status, duration
  });

  it('should log request details on error response', async () => {
    // Given: a middleware instance with mocked logger
    // When: request results in 500 error
    // Then: logger.log() is called with error status
  });

  it('should measure response duration', async () => {
    // Given: a request that takes measurable time
    // When: request completes
    // Then: logged duration is within expected range
  });
});
```

#### Implementation Details

```typescript
// apps/api/src/shared/middleware/logging.middleware.ts
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('close', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(`${method} ${originalUrl} ${statusCode} ${duration}ms`);
    });

    next();
  }
}
```

---

### 2. Global Exception Filter

**Testing**: Write tests FIRST (Unit tests)

#### Tasks

- [ ] Write exception filter unit tests FIRST
- [ ] Create `HttpExceptionFilter` in `apps/api/src/shared/filters/`
- [ ] Log 5xx errors with stack traces (error level)
- [ ] Do NOT log 4xx errors (reduce noise)
- [ ] Register filter globally in `main.ts`

#### Test Scenarios (Write BEFORE Implementation)

```typescript
// apps/api/src/shared/filters/http-exception.filter.spec.ts
describe('HttpExceptionFilter', () => {
  it('should log 5xx errors with error level and stack trace', async () => {
    // Given: an InternalServerErrorException
    // When: filter catches exception
    // Then: logger.error() is called with message and stack
  });

  it('should NOT log 4xx errors', async () => {
    // Given: a BadRequestException
    // When: filter catches exception
    // Then: logger is NOT called
  });

  it('should log unknown errors as 500 with full stack', async () => {
    // Given: a generic Error (not HttpException)
    // When: filter catches exception
    // Then: logger.error() is called with stack trace
    // And: response status is 500
  });

  it('should include request context in log', async () => {
    // Given: a request to POST /api/auth/login
    // When: exception occurs
    // Then: log includes method and URL
  });
});
```

#### Implementation Details

```typescript
// apps/api/src/shared/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : undefined;

    // Only log 5xx errors
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} - ${message}`, stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

### 3. Wire Up in Application

#### Tasks

- [ ] Register `LoggingMiddleware` globally in `AppModule`
- [ ] Register `HttpExceptionFilter` globally in `main.ts`
- [ ] Enable logger buffering in `main.ts`

#### Implementation Details

```typescript
// apps/api/src/app/app.module.ts
@Module({
  // ... existing config
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
```

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  // ... rest of config
}
```

---

### 4. Manual Verification

#### Tasks

- [ ] Start API: `pnpm nx serve api`
- [ ] Make successful request - verify log appears
- [ ] Make request with validation error (4xx) - verify NO log
- [ ] Kill database and make request - verify 500 error is logged with stack trace

---

## Files to Create/Modify

| File                                                        | Action                                      |
| ----------------------------------------------------------- | ------------------------------------------- |
| `apps/api/src/main.ts`                                      | Modify - add logger config, register filter |
| `apps/api/src/app/app.module.ts`                            | Modify - configure middleware               |
| `apps/api/src/shared/middleware/logging.middleware.ts`      | Create                                      |
| `apps/api/src/shared/middleware/logging.middleware.spec.ts` | Create                                      |
| `apps/api/src/shared/middleware/index.ts`                   | Create                                      |
| `apps/api/src/shared/filters/http-exception.filter.ts`      | Create                                      |
| `apps/api/src/shared/filters/http-exception.filter.spec.ts` | Create                                      |
| `apps/api/src/shared/filters/index.ts`                      | Create                                      |

---

## Expected Log Output Examples

### Successful Request

```
[Nest] 12345  - 12/02/2025, 10:30:00 AM  LOG [HTTP] GET /api/health 200 5ms
```

### Client Error (4xx) - NO LOG from filter

```
[Nest] 12345  - 12/02/2025, 10:30:00 AM  LOG [HTTP] POST /api/auth/login 400 12ms
```

(Only the middleware logs the request, the filter does NOT log 4xx)

### Server Error (5xx)

```
[Nest] 12345  - 12/02/2025, 10:30:00 AM  LOG [HTTP] POST /api/auth/login 500 45ms
[Nest] 12345  - 12/02/2025, 10:30:00 AM  ERROR [ExceptionFilter] POST /api/auth/login - Internal server error
Error: Connection refused
    at PostgresClient.connect (...)
    at UserDrizzleRepository.findByEmail (...)
    ...
```

---

## Completion Checklist

- [ ] Middleware tests written and passing
- [ ] Middleware implementation complete
- [ ] Exception filter tests written and passing
- [ ] Exception filter implementation complete
- [ ] All wiring complete in `main.ts` and `AppModule`
- [ ] `pnpm nx test api` passes
- [ ] `pnpm check-all` passes
- [ ] Manual verification: killing DB shows logged errors

---

## References

- [NestJS Logger Documentation](https://docs.nestjs.com/techniques/logger)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [NestJS Middleware](https://docs.nestjs.com/middleware)
