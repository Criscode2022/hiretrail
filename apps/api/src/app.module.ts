import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContactsModule } from './contacts/contacts.module';
import { InterviewsModule } from './interviews/interviews.module';
import { NotesModule } from './notes/notes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';
import { User } from './users/user.entity';
import { Company } from './companies/company.entity';
import { Application } from './applications/application.entity';
import { Contact } from './contacts/contact.entity';
import { Interview } from './interviews/interview.entity';
import { Note } from './notes/note.entity';
import { SeedModule } from './seed/seed.module';

const ENTITIES = [User, Company, Application, Contact, Interview, Note];

function typeOrmConfig() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    return {
      type: 'postgres' as const,
      url,
      ssl:
        url.includes('sslmode=require') || url.includes('neon.tech')
          ? { rejectUnauthorized: false }
          : undefined,
      entities: ENTITIES,
      synchronize: true,
      logging: false,
    };
  }

  // Local / preview: pure-JS SQL.js (no native bindings). Production: set DATABASE_URL (Neon).
  const dbPath =
    process.env.SQLITE_PATH ?? join(process.cwd(), 'data', 'hiretrail.sqlite');
  mkdirSync(join(dbPath, '..'), { recursive: true });

  return {
    type: 'sqljs' as const,
    location: dbPath,
    autoSave: true,
    // Persist to disk so preview restarts keep data when possible
    autoSaveCallback: (data: Uint8Array) => {
      writeFileSync(dbPath, Buffer.from(data));
    },
    ...(existsSync(dbPath)
      ? { database: new Uint8Array(readFileSync(dbPath)) }
      : {}),
    entities: ENTITIES,
    synchronize: true,
    logging: false,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    UsersModule,
    AuthModule,
    CompaniesModule,
    ApplicationsModule,
    ContactsModule,
    InterviewsModule,
    NotesModule,
    DashboardModule,
    SeedModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
