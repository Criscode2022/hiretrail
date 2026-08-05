import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Application } from '../applications/application.entity';
import { Contact } from '../contacts/contact.entity';
import { Interview } from '../interviews/interview.entity';
import { Note } from '../notes/note.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Company,
      Application,
      Contact,
      Interview,
      Note,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
