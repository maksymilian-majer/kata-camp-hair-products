import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/api/src/database/schema/*',
  out: './apps/api/src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL']!,
  },
});
