# Drizzle ORM Repository Patterns

Patterns for Drizzle ORM with PostgreSQL, including schema definition, query builder, and migrations.

## Schema Definition

### Table Definition with pgTable

```typescript
// database/schema.ts
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Hair profiles table
export const hairProfiles = pgTable('hair_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  hairType: varchar('hair_type', { length: 50 }).notNull(),
  porosity: varchar('porosity', { length: 50 }),
  concerns: jsonb('concerns').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Scans table
export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  productName: varchar('product_name', { length: 255 }),
  ingredients: text('ingredients').notNull(),
  analysis: jsonb('analysis').$type<AnalysisResult>(),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Relations Definition

```typescript
// database/schema.ts (continued)
export const usersRelations = relations(users, ({ one, many }) => ({
  hairProfile: one(hairProfiles, {
    fields: [users.id],
    references: [hairProfiles.userId],
  }),
  scans: many(scans),
}));

export const hairProfilesRelations = relations(hairProfiles, ({ one }) => ({
  user: one(users, {
    fields: [hairProfiles.userId],
    references: [users.id],
  }),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
}));
```

### Type Inference

```typescript
// database/schema.ts (continued)
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Inferred types from schema
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type HairProfile = InferSelectModel<typeof hairProfiles>;
export type NewHairProfile = InferInsertModel<typeof hairProfiles>;

export type Scan = InferSelectModel<typeof scans>;
export type NewScan = InferInsertModel<typeof scans>;
```

## Repository Pattern

### Repository Interface

```typescript
// interfaces/scan-repository.interface.ts
export interface IScanRepository {
  findById(id: string): Promise<Scan | null>;
  findByUserId(userId: string): Promise<Scan[]>;
  create(data: NewScan): Promise<Scan>;
  update(id: string, data: Partial<NewScan>): Promise<Scan>;
  delete(id: string): Promise<void>;
}
```

### Repository Implementation

```typescript
// scan.repository.ts
import { Injectable } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../database/connection';
import { scans, type Scan, type NewScan } from '../database/schema';
import { IScanRepository } from './interfaces/scan-repository.interface';

@Injectable()
export class ScanRepository implements IScanRepository {
  async findById(id: string): Promise<Scan | null> {
    const result = await db.select().from(scans).where(eq(scans.id, id)).limit(1);

    return result[0] ?? null;
  }

  async findByUserId(userId: string): Promise<Scan[]> {
    return db.select().from(scans).where(eq(scans.userId, userId)).orderBy(desc(scans.createdAt));
  }

  async create(data: NewScan): Promise<Scan> {
    const result = await db.insert(scans).values(data).returning();

    return result[0];
  }

  async update(id: string, data: Partial<NewScan>): Promise<Scan> {
    const result = await db
      .update(scans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scans.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(scans).where(eq(scans.id, id));
  }
}
```

## Query Builder Patterns

### Select Queries

```typescript
// Simple select
const users = await db.select().from(users);

// Select specific columns
const userEmails = await db.select({ id: users.id, email: users.email }).from(users);

// Select with alias
const result = await db
  .select({
    id: users.id,
    fullName: users.name,
    registeredAt: users.createdAt,
  })
  .from(users);
```

### Where Clauses

```typescript
import { eq, ne, gt, gte, lt, lte, like, ilike, inArray, and, or, not, isNull, isNotNull } from 'drizzle-orm';

// Equality
const user = await db.select().from(users).where(eq(users.id, userId));

// Not equal
const activeUsers = await db.select().from(users).where(ne(users.status, 'deleted'));

// Comparisons
const recentScans = await db
  .select()
  .from(scans)
  .where(gte(scans.createdAt, new Date('2024-01-01')));

// Pattern matching
const searchUsers = await db
  .select()
  .from(users)
  .where(ilike(users.name, `%${searchTerm}%`));

// In array
const selectedUsers = await db.select().from(users).where(inArray(users.id, userIds));

// Compound conditions
const filteredScans = await db
  .select()
  .from(scans)
  .where(and(eq(scans.userId, userId), gte(scans.score, 70), isNotNull(scans.analysis)));

// OR conditions
const results = await db
  .select()
  .from(hairProfiles)
  .where(or(eq(hairProfiles.hairType, 'curly'), eq(hairProfiles.hairType, 'wavy')));
```

### Joins

```typescript
// Inner join
const scansWithUsers = await db
  .select({
    scan: scans,
    userName: users.name,
  })
  .from(scans)
  .innerJoin(users, eq(scans.userId, users.id));

// Left join
const usersWithProfiles = await db
  .select({
    user: users,
    profile: hairProfiles,
  })
  .from(users)
  .leftJoin(hairProfiles, eq(users.id, hairProfiles.userId));

// Multiple joins
const fullScanData = await db
  .select({
    scan: scans,
    user: users,
    profile: hairProfiles,
  })
  .from(scans)
  .innerJoin(users, eq(scans.userId, users.id))
  .leftJoin(hairProfiles, eq(users.id, hairProfiles.userId));
```

### Ordering and Pagination

```typescript
import { desc, asc } from 'drizzle-orm';

// Order by
const recentScans = await db.select().from(scans).orderBy(desc(scans.createdAt));

// Multiple order columns
const sorted = await db.select().from(scans).orderBy(desc(scans.score), asc(scans.createdAt));

// Pagination
const page = 1;
const pageSize = 10;

const paginatedScans = await db
  .select()
  .from(scans)
  .where(eq(scans.userId, userId))
  .orderBy(desc(scans.createdAt))
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

### Aggregations

```typescript
import { count, avg, sum, min, max } from 'drizzle-orm';

// Count
const totalScans = await db.select({ count: count() }).from(scans).where(eq(scans.userId, userId));

// Average
const avgScore = await db
  .select({ average: avg(scans.score) })
  .from(scans)
  .where(eq(scans.userId, userId));

// Group by
const scansByUser = await db
  .select({
    userId: scans.userId,
    totalScans: count(),
    avgScore: avg(scans.score),
  })
  .from(scans)
  .groupBy(scans.userId);
```

### Insert Operations

```typescript
// Single insert
const newScan = await db
  .insert(scans)
  .values({
    userId: userId,
    productName: 'Shampoo XYZ',
    ingredients: 'water, sodium laureth sulfate...',
  })
  .returning();

// Multiple insert
const newUsers = await db
  .insert(users)
  .values([
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ])
  .returning();

// Insert with conflict handling (upsert)
const upserted = await db
  .insert(users)
  .values({ email: 'user@example.com', name: 'Updated Name' })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: 'Updated Name', updatedAt: new Date() },
  })
  .returning();
```

### Update Operations

```typescript
// Simple update
const updated = await db.update(scans).set({ score: 85 }).where(eq(scans.id, scanId)).returning();

// Update with multiple values
const updatedProfile = await db
  .update(hairProfiles)
  .set({
    hairType: 'curly',
    porosity: 'high',
    updatedAt: new Date(),
  })
  .where(eq(hairProfiles.userId, userId))
  .returning();
```

### Delete Operations

```typescript
// Simple delete
await db.delete(scans).where(eq(scans.id, scanId));

// Delete with conditions
await db.delete(scans).where(and(eq(scans.userId, userId), lt(scans.createdAt, new Date('2023-01-01'))));
```

## Database Connection

### Connection Setup

```typescript
// database/connection.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
```

### NestJS Integration

```typescript
// database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = Symbol('drizzle-connection');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
```

## Migration Workflow

### Generate Migrations

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Or with specific output
pnpm drizzle-kit generate --name add_scans_table
```

### Push Schema (Development)

```bash
# Push schema directly to database (dev only)
pnpm drizzle-kit push
```

### Run Migrations

```typescript
// database/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  await migrate(db, { migrationsFolder: './drizzle' });

  await pool.end();
}

runMigrations();
```

### Drizzle Config

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './apps/api/src/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Error Handling

### Return null vs throw

```typescript
// Return null for "not found" cases
async findById(id: string): Promise<Scan | null> {
  const result = await db
    .select()
    .from(scans)
    .where(eq(scans.id, id))
    .limit(1);

  return result[0] ?? null; // Return null if not found
}

// Let the service layer decide what to do
async getScan(id: string): Promise<Scan> {
  const scan = await this.repository.findById(id);
  if (!scan) {
    throw new ScanNotFoundException(id); // Service throws
  }
  return scan;
}
```

### Transaction Handling

```typescript
import { db } from '../database/connection';

async createScanWithProfile(
  scanData: NewScan,
  profileData: NewHairProfile,
): Promise<{ scan: Scan; profile: HairProfile }> {
  return await db.transaction(async (tx) => {
    const [profile] = await tx
      .insert(hairProfiles)
      .values(profileData)
      .returning();

    const [scan] = await tx
      .insert(scans)
      .values({ ...scanData, profileId: profile.id })
      .returning();

    return { scan, profile };
  });
}
```

## Best Practices

### DO:

- Use type inference from schema (`InferSelectModel`, `InferInsertModel`)
- Return `null` from repository for not-found cases
- Use transactions for multi-table operations
- Use explicit column selection when not all columns needed
- Use `returning()` for insert/update operations

### DON'T:

- Use raw SQL unless absolutely necessary
- Throw exceptions in repository layer
- Mix business logic into repository
- Forget to handle null results
- Skip migrations in production
