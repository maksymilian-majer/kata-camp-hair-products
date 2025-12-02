# Testcontainers Integration Patterns

Patterns for using @testcontainers/postgresql for backend integration testing with real PostgreSQL databases.

## Import Conventions

- **Same folder**: Use relative `./` imports (e.g., `import { setupTestDatabase } from './database'`)
- **Parent/other folders**: Use `@/api/` alias (e.g., `import * as schema from '@/api/database/schema'`)
- **Shared libs**: Use package imports (e.g., `import type { User } from '@hair-product-scanner/shared'`)
- **NEVER use `../`** - parent imports must use `@/api/` alias

## Setup

### Installation

```bash
pnpm add -D @testcontainers/postgresql testcontainers
```

### Basic Container Setup

```typescript
// test/setup/database.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '@/api/database/schema';

let container: StartedPostgreSqlContainer;
let pool: Pool;
let db: ReturnType<typeof drizzle>;

export async function setupTestDatabase() {
  // Start PostgreSQL container
  container = await new PostgreSqlContainer().withDatabase('test_db').withUsername('test').withPassword('test').start();

  // Create connection pool
  pool = new Pool({
    connectionString: container.getConnectionUri(),
  });

  // Initialize Drizzle
  db = drizzle(pool, { schema });

  // Run migrations
  await migrate(db, { migrationsFolder: './drizzle' });

  return { db, pool, container };
}

export async function teardownTestDatabase() {
  if (pool) {
    await pool.end();
  }
  if (container) {
    await container.stop();
  }
}

export function getTestDatabase() {
  return db;
}
```

## Test Lifecycle

### Global Setup (vitest.config.ts)

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globalSetup: './test/setup/global-setup.ts',
    setupFiles: ['./test/setup/test-setup.ts'],
  },
});
```

### Global Setup File

```typescript
// test/setup/global-setup.ts
import { setupTestDatabase, teardownTestDatabase } from './database';

export async function setup() {
  console.log('Starting test database container...');
  const { db } = await setupTestDatabase();

  // Store connection for tests
  (globalThis as any).__TEST_DB__ = db;

  console.log('Test database ready');
}

export async function teardown() {
  console.log('Stopping test database container...');
  await teardownTestDatabase();
  console.log('Test database stopped');
}
```

### Per-Test Setup

```typescript
// test/setup/test-setup.ts
import { beforeEach, afterEach } from 'vitest';
import { getTestDatabase } from './database';
import { sql } from 'drizzle-orm';

beforeEach(async () => {
  const db = getTestDatabase();
  // Truncate all tables before each test
  await db.execute(sql`TRUNCATE TABLE scans, hair_profiles, users CASCADE`);
});

afterEach(async () => {
  // Any cleanup needed
});
```

## Repository Integration Tests

### Basic Repository Test

```typescript
// scan.repository.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ScanRepository } from './scan.repository';
import { getTestDatabase } from '@/api/test/setup/database';
import { users, scans } from '@/api/database/schema';

describe('ScanRepository Integration', () => {
  let repository: ScanRepository;
  let db: ReturnType<typeof getTestDatabase>;
  let testUserId: string;

  beforeEach(async () => {
    db = getTestDatabase();
    repository = new ScanRepository(db);

    // Create test user
    const [user] = await db.insert(users).values({ email: 'test@example.com', name: 'Test User' }).returning();
    testUserId = user.id;
  });

  describe('create', () => {
    it('creates a new scan', async () => {
      const scanData = {
        userId: testUserId,
        productName: 'Test Shampoo',
        ingredients: 'water, sodium laureth sulfate',
      };

      const result = await repository.create(scanData);

      expect(result.id).toBeDefined();
      expect(result.productName).toBe('Test Shampoo');
      expect(result.userId).toBe(testUserId);
    });
  });

  describe('findById', () => {
    it('returns scan when found', async () => {
      // Arrange - create a scan
      const [scan] = await db
        .insert(scans)
        .values({
          userId: testUserId,
          productName: 'Test Product',
          ingredients: 'water',
        })
        .returning();

      // Act
      const result = await repository.findById(scan.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.productName).toBe('Test Product');
    });

    it('returns null when not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns all scans for user ordered by date', async () => {
      // Create multiple scans
      await db.insert(scans).values([
        { userId: testUserId, productName: 'Product 1', ingredients: 'a' },
        { userId: testUserId, productName: 'Product 2', ingredients: 'b' },
      ]);

      const result = await repository.findByUserId(testUserId);

      expect(result).toHaveLength(2);
      // Most recent first
      expect(result[0].createdAt.getTime()).toBeGreaterThanOrEqual(result[1].createdAt.getTime());
    });

    it('returns empty array when user has no scans', async () => {
      const result = await repository.findByUserId('other-user-id');
      expect(result).toEqual([]);
    });
  });
});
```

### Testing Transactions

```typescript
// transaction.spec.ts
describe('Transaction handling', () => {
  it('rolls back on error', async () => {
    const db = getTestDatabase();

    try {
      await db.transaction(async (tx) => {
        // Insert user
        await tx.insert(users).values({
          email: 'transaction@test.com',
          name: 'Transaction User',
        });

        // This should fail and rollback
        throw new Error('Simulated error');
      });
    } catch {
      // Expected error
    }

    // Verify rollback
    const [user] = await db.select().from(users).where(eq(users.email, 'transaction@test.com'));

    expect(user).toBeUndefined();
  });

  it('commits on success', async () => {
    const db = getTestDatabase();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        email: 'success@test.com',
        name: 'Success User',
      });
    });

    const [user] = await db.select().from(users).where(eq(users.email, 'success@test.com'));

    expect(user).toBeDefined();
  });
});
```

## Seeding Test Data

### Test Data Factory

```typescript
// test/factories/user.factory.ts
import { getTestDatabase } from '@/api/test/setup/database';
import { users, NewUser } from '@/api/database/schema';

export async function createTestUser(overrides?: Partial<NewUser>) {
  const db = getTestDatabase();

  const [user] = await db
    .insert(users)
    .values({
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      ...overrides,
    })
    .returning();

  return user;
}

export async function createTestUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `test-${i}-${Date.now()}@example.com`,
      name: `Test User ${i}`,
    });
    users.push(user);
  }
  return users;
}
```

### Using Factories in Tests

```typescript
// user.service.spec.ts
import { createTestUser, createTestUsers } from '@/api/test/factories/user.factory';

describe('UserService', () => {
  it('finds user by email', async () => {
    const user = await createTestUser({ email: 'specific@test.com' });

    const result = await userService.findByEmail('specific@test.com');

    expect(result?.id).toBe(user.id);
  });

  it('handles multiple users', async () => {
    await createTestUsers(5);

    const result = await userService.findAll();

    expect(result).toHaveLength(5);
  });
});
```

## Complex Scenario Testing

### Testing with Related Data

```typescript
describe('ScanService with HairProfile', () => {
  let testUser: User;
  let testProfile: HairProfile;

  beforeEach(async () => {
    const db = getTestDatabase();

    // Create user with profile
    [testUser] = await db.insert(users).values({ email: 'profile@test.com', name: 'Profile User' }).returning();

    [testProfile] = await db
      .insert(hairProfiles)
      .values({
        userId: testUser.id,
        hairType: 'curly',
        porosity: 'high',
        concerns: ['frizz', 'dryness'],
      })
      .returning();
  });

  it('analyzes product compatibility with hair profile', async () => {
    const result = await scanService.analyzeProduct(testUser.id, 'Test Shampoo', 'water, glycerin, coconut oil');

    expect(result.compatibility).toBeDefined();
    expect(result.compatibility.score).toBeGreaterThan(0);
    expect(result.recommendedFor).toContain('curly');
  });
});
```

### Testing Edge Cases

```typescript
describe('Edge cases', () => {
  it('handles concurrent inserts', async () => {
    const db = getTestDatabase();
    const emails = Array.from({ length: 10 }, (_, i) => `concurrent-${i}@test.com`);

    // Insert concurrently
    await Promise.all(emails.map((email) => db.insert(users).values({ email, name: 'Concurrent User' })));

    // All should be inserted
    const result = await db.select().from(users);
    expect(result).toHaveLength(10);
  });

  it('handles unique constraint violation', async () => {
    const db = getTestDatabase();

    await db.insert(users).values({
      email: 'duplicate@test.com',
      name: 'Original User',
    });

    await expect(
      db.insert(users).values({
        email: 'duplicate@test.com',
        name: 'Duplicate User',
      })
    ).rejects.toThrow();
  });

  it('handles large data sets', async () => {
    const db = getTestDatabase();

    // Insert 100 users
    const userValues = Array.from({ length: 100 }, (_, i) => ({
      email: `bulk-${i}@test.com`,
      name: `Bulk User ${i}`,
    }));

    await db.insert(users).values(userValues);

    const result = await db.select().from(users);
    expect(result).toHaveLength(100);
  });
});
```

## Performance Considerations

### Container Reuse

```typescript
// test/setup/database.ts
let sharedContainer: StartedPostgreSqlContainer | null = null;

export async function getSharedContainer() {
  if (!sharedContainer) {
    sharedContainer = await new PostgreSqlContainer().withReuse().start();
  }
  return sharedContainer;
}
```

### Parallel Test Isolation

```typescript
// For parallel tests, use schemas instead of separate containers
beforeEach(async () => {
  const db = getTestDatabase();
  const schemaName = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}`);
  await db.execute(sql`SET search_path TO ${sql.identifier(schemaName)}`);

  // Run migrations in this schema
  await migrate(db, { migrationsFolder: './drizzle' });
});
```

## Best Practices

### DO:

- Start container once per test suite (global setup)
- Truncate tables between tests
- Use factories for test data
- Test real database behavior
- Test constraints and transactions

### DON'T:

- Start new container per test (slow)
- Rely on test execution order
- Leave data between tests
- Skip database cleanup
- Test with in-memory databases (different behavior)

### Timeout Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000, // 30s for container startup
    hookTimeout: 60000, // 60s for setup/teardown
  },
});
```
