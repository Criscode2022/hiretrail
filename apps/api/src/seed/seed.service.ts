import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import {
  Application,
  ApplicationPriority,
  ApplicationStatus,
} from '../applications/application.entity';
import { Contact } from '../contacts/contact.entity';
import {
  Interview,
  InterviewOutcome,
  InterviewType,
} from '../interviews/interview.entity';
import { Note } from '../notes/note.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
    @InjectRepository(Contact) private readonly contacts: Repository<Contact>,
    @InjectRepository(Interview)
    private readonly interviews: Repository<Interview>,
    @InjectRepository(Note) private readonly notes: Repository<Note>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START === 'false') return;
    const count = await this.users.count();
    if (count > 0) return;
    this.log.log('Seeding demo data…');
    await this.seedDemo();
    this.log.log('Demo ready: demo@hiretrail.app / demo1234');
  }

  async seedDemo() {
    const passwordHash = await bcrypt.hash('demo1234', 10);
    const user = await this.users.save(
      this.users.create({
        email: 'demo@hiretrail.app',
        passwordHash,
        name: 'Alex Rivera',
        title: 'Senior Full-Stack Engineer',
        targetRole: 'Staff Frontend / Full-Stack',
        targetLocation: 'Remote EU / Madrid',
      }),
    );

    const companyData = [
      {
        name: 'Neon',
        website: 'https://neon.tech',
        industry: 'Developer Tools',
        location: 'Remote',
      },
      {
        name: 'Vercel',
        website: 'https://vercel.com',
        industry: 'Cloud / DX',
        location: 'Remote',
      },
      {
        name: 'Stripe',
        website: 'https://stripe.com',
        industry: 'Fintech',
        location: 'Dublin',
      },
      {
        name: 'Typeform',
        website: 'https://typeform.com',
        industry: 'SaaS',
        location: 'Barcelona',
      },
      {
        name: 'Factorial',
        website: 'https://factorialhr.com',
        industry: 'HR Tech',
        location: 'Barcelona',
      },
      {
        name: 'Cabify',
        website: 'https://cabify.com',
        industry: 'Mobility',
        location: 'Madrid',
      },
    ];

    const companies = await this.companies.save(
      companyData.map((c) => this.companies.create({ ...c, userId: user.id })),
    );

    const byName = Object.fromEntries(companies.map((c) => [c.name, c]));

    const appsSeed: Array<{
      company: string;
      title: string;
      status: ApplicationStatus;
      priority: ApplicationPriority;
      salaryMin?: number;
      salaryMax?: number;
      location?: string;
      remote?: boolean;
      source?: string;
      appliedAt?: Date;
      followUpAt?: Date;
      jobUrl?: string;
      description?: string;
    }> = [
      {
        company: 'Neon',
        title: 'Senior Full-Stack Engineer',
        status: ApplicationStatus.INTERVIEW,
        priority: ApplicationPriority.HIGH,
        salaryMin: 75000,
        salaryMax: 95000,
        location: 'Remote EU',
        remote: true,
        source: 'Company site',
        appliedAt: daysAgo(18),
        followUpAt: daysFromNow(2),
        jobUrl: 'https://neon.tech/careers',
        description: 'Postgres serverless platform. Strong TypeScript + React.',
      },
      {
        company: 'Vercel',
        title: 'Software Engineer, Dashboard',
        status: ApplicationStatus.SCREENING,
        priority: ApplicationPriority.HIGH,
        salaryMin: 90000,
        salaryMax: 120000,
        location: 'Remote',
        remote: true,
        source: 'Referral',
        appliedAt: daysAgo(10),
        followUpAt: daysFromNow(5),
        jobUrl: 'https://vercel.com/careers',
      },
      {
        company: 'Stripe',
        title: 'Frontend Engineer',
        status: ApplicationStatus.APPLIED,
        priority: ApplicationPriority.MEDIUM,
        salaryMin: 85000,
        salaryMax: 110000,
        location: 'Dublin',
        remote: false,
        source: 'LinkedIn',
        appliedAt: daysAgo(6),
        followUpAt: daysFromNow(1),
      },
      {
        company: 'Typeform',
        title: 'Staff Frontend Engineer',
        status: ApplicationStatus.OFFER,
        priority: ApplicationPriority.HIGH,
        salaryMin: 80000,
        salaryMax: 98000,
        location: 'Barcelona / Hybrid',
        remote: true,
        source: 'Recruiter',
        appliedAt: daysAgo(45),
      },
      {
        company: 'Factorial',
        title: 'Full-Stack Engineer (Angular)',
        status: ApplicationStatus.REJECTED,
        priority: ApplicationPriority.MEDIUM,
        salaryMin: 55000,
        salaryMax: 70000,
        location: 'Barcelona',
        remote: true,
        source: 'Job board',
        appliedAt: daysAgo(40),
      },
      {
        company: 'Cabify',
        title: 'Platform Engineer',
        status: ApplicationStatus.WISHLIST,
        priority: ApplicationPriority.LOW,
        salaryMin: 60000,
        salaryMax: 75000,
        location: 'Madrid',
        remote: false,
        source: 'Company site',
      },
      {
        company: 'Neon',
        title: 'Developer Experience Engineer',
        status: ApplicationStatus.APPLIED,
        priority: ApplicationPriority.MEDIUM,
        salaryMin: 70000,
        salaryMax: 90000,
        location: 'Remote',
        remote: true,
        source: 'Twitter/X',
        appliedAt: daysAgo(21),
        followUpAt: daysAgo(2),
      },
    ];

    const apps: Application[] = [];
    for (const seed of appsSeed) {
      const { company, ...rest } = seed;
      const app = await this.apps.save(
        this.apps.create({
          ...rest,
          userId: user.id,
          companyId: byName[company].id,
          currency: 'EUR',
        }),
      );
      apps.push(app);
    }

    await this.contacts.save([
      this.contacts.create({
        userId: user.id,
        companyId: byName['Neon'].id,
        name: 'Maya Chen',
        email: 'maya@neon.tech',
        role: 'Engineering Manager',
        linkedinUrl: 'https://linkedin.com',
        notes: 'Met at Postgres conference. Very collaborative culture.',
      }),
      this.contacts.create({
        userId: user.id,
        companyId: byName['Vercel'].id,
        name: 'Jordan Lee',
        email: 'jordan@vercel.com',
        role: 'Recruiter',
        notes: 'Introduced via mutual friend.',
      }),
      this.contacts.create({
        userId: user.id,
        companyId: byName['Typeform'].id,
        name: 'Sofia Martí',
        role: 'Tech Lead',
        email: 'sofia@typeform.com',
      }),
    ]);

    await this.interviews.save([
      this.interviews.create({
        userId: user.id,
        applicationId: apps[0].id,
        type: InterviewType.TECHNICAL,
        scheduledAt: daysFromNow(3),
        location: 'Google Meet',
        outcome: InterviewOutcome.PENDING,
        notes: 'System design + live coding. Review Postgres scaling.',
      }),
      this.interviews.create({
        userId: user.id,
        applicationId: apps[0].id,
        type: InterviewType.PHONE,
        scheduledAt: daysAgo(5),
        location: 'Phone',
        outcome: InterviewOutcome.PASSED,
        notes: 'Strong culture fit conversation.',
      }),
      this.interviews.create({
        userId: user.id,
        applicationId: apps[1].id,
        type: InterviewType.VIDEO,
        scheduledAt: daysFromNow(6),
        location: 'Zoom',
        outcome: InterviewOutcome.PENDING,
      }),
      this.interviews.create({
        userId: user.id,
        applicationId: apps[3].id,
        type: InterviewType.FINAL,
        scheduledAt: daysAgo(7),
        location: 'Barcelona HQ',
        outcome: InterviewOutcome.PASSED,
        notes: 'Received verbal offer pending paper.',
      }),
    ]);

    await this.notes.save([
      this.notes.create({
        userId: user.id,
        applicationId: apps[0].id,
        body: 'Recruiter said team is doubling DX headcount this quarter. Emphasize open-source contributions.',
      }),
      this.notes.create({
        userId: user.id,
        applicationId: apps[1].id,
        body: 'Dashboard team owns usage analytics and billing UI. Prep edge cases around multi-tenant data.',
      }),
      this.notes.create({
        userId: user.id,
        applicationId: apps[3].id,
        body: 'Offer: 92k EUR + equity. Decision deadline in 10 days. Negotiate remote flexibility.',
      }),
    ]);
  }
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}
