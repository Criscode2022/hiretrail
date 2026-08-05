import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      ok: true,
      service: 'hiretrail-api',
      database: process.env.DATABASE_URL?.trim() ? 'neon' : 'sqljs',
      time: new Date().toISOString(),
    };
  }
}
