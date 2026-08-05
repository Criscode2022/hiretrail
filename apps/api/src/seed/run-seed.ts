/**
 * Optional manual seed entrypoint.
 * Demo data is also auto-seeded on first boot when the users table is empty.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seed = app.get(SeedService);
  await seed.seedDemo();
  await app.close();
  console.log('Seed complete: demo@hiretrail.app / demo1234');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
