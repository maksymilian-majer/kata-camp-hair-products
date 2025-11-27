# Backend for Frontend (BFF) Patterns

Patterns for BFF layer implementation with NestJS, focusing on read-optimized response shapes for frontend needs.

## What is BFF?

The Backend for Frontend (BFF) pattern is an **anti-corruption layer** that shields the frontend from backend complexity. It translates between what the backend provides and what the frontend needs for display.

**Key Principle**: BFF is for **reads only** - aggregating data across multiple tables/domains into screen-optimized responses. Writes (creates, updates, deletes) go through standard RESTful domain endpoints.

## Core Purpose

1. **Anti-Corruption**: Protects frontend from database schemas and internal models
2. **Query Optimization**: Single SQL query across multiple tables instead of multiple API calls
3. **Shape Definition**: Backend developers understand frontend needs by looking at BFF response shapes

## Architecture

```
Frontend (Next.js)
         ↓
    BFF Layer        ← "What the screen needs" (READ ONLY)
         ↓
 Drizzle / Repositories  ← Direct data access, optimized queries
```

**Important**: BFF does NOT call services. It queries data directly using Drizzle or repositories to enable efficient SQL queries across tables.

## BFF Types Organization

BFF-specific types live in a dedicated subdirectory in the shared library:

```
libs/shared/src/
├── types/           # Domain types
│   ├── user.ts
│   ├── scan.ts
│   └── product.ts
├── bff/             # BFF response shapes (read-only)
│   ├── dashboard.ts
│   └── index.ts
└── schemas/         # Zod validation schemas
    └── scan.schema.ts
```

### BFF Types vs Domain Types

```typescript
// types/scan.ts - Domain type (internal)
export type Scan = {
  id: string;
  userId: string;
  productName: string | null;
  ingredients: string;
  score: number | null;
  createdAt: Date;
};

// bff/dashboard.ts - BFF type (frontend-optimized, read-only)
export type DashboardResponse = {
  stats: DashboardStats;
  recentComparisons: ComparisonSummary[];
  favoriteProducts: ProductSummary[];
};

export type DashboardStats = {
  totalScans: number;
  favoriteCount: number;
  averageScore: number | null; // Raw score, UI formats display
};

export type ComparisonSummary = {
  id: string;
  products: string[]; // Product names
  winner: string; // Winner product name
  comparedAt: string; // ISO date string
};

export type ProductSummary = {
  id: string;
  name: string;
  score: number; // Raw score (0-100)
  maxScore: number; // Max possible score
};
```

## Decision Framework: BFF vs RESTful

### Use BFF When (READ ONLY):

- Screen needs data from multiple tables/domains
- Data requires aggregation (counts, averages)
- Significant transformation for display
- Dashboard-style screens

### Use RESTful When:

- Any write operation (create, update, delete)
- Simple CRUD on single domain
- Standard resource operations

### Decision Matrix

| Operation       | Pattern | Example Route                 |
| --------------- | ------- | ----------------------------- |
| Dashboard load  | BFF     | `GET /api/bff/dashboard`      |
| Profile screen  | BFF     | `GET /api/bff/profile-screen` |
| Create scan     | RESTful | `POST /api/scans`             |
| Update product  | RESTful | `PUT /api/products/:id`       |
| Delete favorite | RESTful | `DELETE /api/favorites/:id`   |

**BFF is NEVER used for writes.**

## Implementation with CQRS Pattern

Use NestJS CQRS for clean query handling. See: https://docs.nestjs.com/recipes/cqrs

### Installation

```bash
pnpm add @nestjs/cqrs
```

### Query Definition

```typescript
// bff/dashboard/queries/get-dashboard.query.ts
export class GetDashboardQuery {
  constructor(public readonly userId: string) {}
}
```

### Query Handler (Direct Drizzle Access)

```typescript
// bff/dashboard/queries/get-dashboard.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { eq, count, avg, desc } from 'drizzle-orm';
import { DRIZZLE } from '../../../database/drizzle.provider';
import { scans, favorites, comparisons, products } from '../../../database/schema';
import { GetDashboardQuery } from './get-dashboard.query';
import type { DashboardResponse } from '@hair-product-scanner/shared/bff';

@QueryHandler(GetDashboardQuery)
export class GetDashboardHandler implements IQueryHandler<GetDashboardQuery> {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async execute(query: GetDashboardQuery): Promise<DashboardResponse> {
    const { userId } = query;

    // Single query for stats using Drizzle
    const [stats] = await this.db
      .select({
        totalScans: count(scans.id),
        averageScore: avg(scans.score),
      })
      .from(scans)
      .where(eq(scans.userId, userId));

    // Count favorites
    const [favStats] = await this.db
      .select({ count: count(favorites.id) })
      .from(favorites)
      .where(eq(favorites.userId, userId));

    // Recent comparisons with winner - efficient join query
    const recentComparisons = await this.db
      .select({
        id: comparisons.id,
        winnerId: comparisons.winnerId,
        winnerName: products.name,
        comparedAt: comparisons.createdAt,
      })
      .from(comparisons)
      .leftJoin(products, eq(comparisons.winnerId, products.id))
      .where(eq(comparisons.userId, userId))
      .orderBy(desc(comparisons.createdAt))
      .limit(3);

    // Get comparison products (separate query for simplicity)
    const comparisonProducts = await this.db
      .select({
        comparisonId: comparisonItems.comparisonId,
        productName: products.name,
      })
      .from(comparisonItems)
      .innerJoin(products, eq(comparisonItems.productId, products.id))
      .where(
        inArray(
          comparisonItems.comparisonId,
          recentComparisons.map((c) => c.id)
        )
      );

    // Transform to frontend shape (raw data, no UI formatting)
    return {
      stats: {
        totalScans: stats.totalScans,
        favoriteCount: favStats.count,
        averageScore: stats.averageScore ? Math.round(stats.averageScore) : null,
      },
      recentComparisons: recentComparisons.map((c) => ({
        id: c.id,
        products: comparisonProducts.filter((p) => p.comparisonId === c.id).map((p) => p.productName),
        winner: c.winnerName,
        comparedAt: c.comparedAt.toISOString(),
      })),
      favoriteProducts: [], // Separate query if needed
    };
  }
}
```

### BFF Controller

```typescript
// bff/dashboard/dashboard.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { GetDashboardQuery } from './queries/get-dashboard.query';
import type { DashboardResponse } from '@hair-product-scanner/shared/bff';

@Controller('api/bff/dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getDashboard(@Req() req: Request): Promise<DashboardResponse> {
    const userId = req.user!.id;
    return this.queryBus.execute(new GetDashboardQuery(userId));
  }
}
```

### BFF Module

```typescript
// bff/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../database/database.module';
import { DashboardController } from './dashboard.controller';
import { GetDashboardHandler } from './queries/get-dashboard.handler';

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [DashboardController],
  providers: [GetDashboardHandler],
})
export class DashboardModule {}
```

## BFF Returns Raw Data

BFF returns **raw data**, not UI-formatted strings. The frontend decides how to display it.

```typescript
// ✅ GOOD: Raw data from BFF
const response = {
  score: 85, // Raw number
  maxScore: 100, // For context
  scannedAt: '2024-01-15T10:30:00Z', // ISO date string
};

// Frontend formats for display:
// `${score}/${maxScore}` → "85/100"
// score >= 70 ? 'green' : 'red' → UI decides colors
// new Date(scannedAt).toLocaleDateString() → "Jan 15"

// ❌ BAD: Pre-formatted UI strings from BFF
const badResponse = {
  score: '85/100', // Don't format in BFF
  scoreColor: 'green', // Don't send UI hints
  scannedAt: 'Jan 15', // Don't format dates
};
```

**Why raw data?**

- Frontend may need different formats (mobile vs desktop)
- Localization happens on frontend
- UI styling decisions belong in UI layer
- Raw data is more flexible

## BFF Module Structure

```
apps/api/src/
├── app/
│   ├── bff/                           # BFF modules (READ ONLY)
│   │   ├── dashboard/
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── queries/
│   │   │       ├── get-dashboard.query.ts
│   │   │       └── get-dashboard.handler.ts
│   │   └── profile-screen/
│   │       ├── profile-screen.module.ts
│   │       ├── profile-screen.controller.ts
│   │       └── queries/
│   │           └── ...
│   ├── scans/                         # Domain modules (CRUD)
│   │   ├── scans.module.ts
│   │   ├── scans.controller.ts
│   │   ├── scans.service.ts
│   │   └── scans.repository.ts
│   └── products/
│       └── ...
└── database/
    └── schema.ts
```

## Best Practices

### DO:

- Use BFF only for reads (GET requests)
- Query Drizzle directly for efficient SQL
- Use CQRS QueryBus for clean separation
- Return raw data (numbers, ISO dates)
- Use screen-optimized field names (e.g., `scannedAt` not `createdAt`)
- Keep BFF types in shared library

### DON'T:

- Use BFF for writes (POST, PUT, DELETE)
- Call services from BFF (use Drizzle/repositories directly)
- Format data for display (no "85/100", no colors)
- Expose database schemas or internal models
- Add extra abstraction layers

### Naming Conventions

- BFF routes: `/api/bff/{screen-name}`
- BFF types: `{Screen}Response`, `{Component}Summary`
- Query classes: `Get{Screen}Query`
- Query handlers: `Get{Screen}Handler`

### Type Safety

```typescript
// Shared types ensure frontend-backend contract
// libs/shared/src/bff/index.ts
export type { DashboardResponse, DashboardStats } from './dashboard';
export type { ProfileScreenResponse } from './profile-screen';
```

Frontend imports types:

```typescript
import type { DashboardResponse } from '@hair-product-scanner/shared/bff';

const data: DashboardResponse = await fetch('/api/bff/dashboard').then((r) => r.json());
```

## Why Direct Drizzle Access?

1. **Single Query**: Join multiple tables in one SQL query instead of N+1 service calls
2. **No Unnecessary Layers**: BFF is already a thin layer - no need for services
3. **Query Optimization**: Full control over SQL for performance
4. **Simplicity**: Less code, easier to understand and maintain

```typescript
// Instead of calling multiple services:
// ❌ const scans = await scanService.findByUser(userId);
// ❌ const favorites = await favoriteService.findByUser(userId);
// ❌ const comparisons = await comparisonService.findRecent(userId);

// Use a single optimized query:
// ✅ Direct Drizzle query with joins
const dashboardData = await this.db
  .select({
    scanCount: count(scans.id),
    favoriteCount: count(favorites.id),
    // ... more aggregations
  })
  .from(scans)
  .leftJoin(favorites, eq(favorites.userId, scans.userId))
  .where(eq(scans.userId, userId));
```
