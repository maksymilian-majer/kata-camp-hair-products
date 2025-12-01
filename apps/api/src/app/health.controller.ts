import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { DRIZZLE, DrizzleDB } from '../database';

@Controller('health')
export class HealthController {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  @Get()
  async check() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch {
      return { status: 'error' };
    }
  }
}
