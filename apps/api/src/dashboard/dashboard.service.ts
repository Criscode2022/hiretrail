import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Application,
  ApplicationStatus,
} from '../applications/application.entity';
import { Interview, InterviewOutcome } from '../interviews/interview.entity';
import { Company } from '../companies/company.entity';
import { Contact } from '../contacts/contact.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
    @InjectRepository(Interview)
    private readonly interviews: Repository<Interview>,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
    @InjectRepository(Contact)
    private readonly contacts: Repository<Contact>,
  ) {}

  async summary(userId: string) {
    const applications = await this.apps.find({
      where: { userId },
      relations: { company: true },
      order: { updatedAt: 'DESC' },
    });

    const byStatus = Object.values(ApplicationStatus).reduce(
      (acc, status) => {
        acc[status] = applications.filter((a) => a.status === status).length;
        return acc;
      },
      {} as Record<ApplicationStatus, number>,
    );

    const active = applications.filter(
      (a) =>
        ![
          ApplicationStatus.REJECTED,
          ApplicationStatus.WITHDRAWN,
          ApplicationStatus.OFFER,
        ].includes(a.status),
    ).length;

    const appliedCount = applications.filter(
      (a) => a.status !== ApplicationStatus.WISHLIST,
    ).length;
    const interviewCount = applications.filter((a) =>
      [
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFER,
        ApplicationStatus.REJECTED,
      ].includes(a.status),
    ).length;
    const offerCount = byStatus[ApplicationStatus.OFFER] ?? 0;

    const conversion = {
      applyRate:
        applications.length > 0
          ? Math.round((appliedCount / applications.length) * 100)
          : 0,
      interviewRate:
        appliedCount > 0
          ? Math.round((interviewCount / appliedCount) * 100)
          : 0,
      offerRate:
        interviewCount > 0
          ? Math.round((offerCount / interviewCount) * 100)
          : 0,
    };

    const salaries = applications
      .map((a) => {
        if (a.salaryMin && a.salaryMax) return (a.salaryMin + a.salaryMax) / 2;
        return a.salaryMin ?? a.salaryMax ?? null;
      })
      .filter((v): v is number => v != null);

    const avgSalary =
      salaries.length > 0
        ? Math.round(salaries.reduce((s, n) => s + n, 0) / salaries.length)
        : null;

    const now = new Date();
    const inSeven = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingInterviews = await this.interviews
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.application', 'application')
      .leftJoinAndSelect('application.company', 'company')
      .where('i.user_id = :userId', { userId })
      .andWhere('i.scheduled_at >= :now', { now: now.toISOString() })
      .andWhere('i.scheduled_at <= :inSeven', {
        inSeven: inSeven.toISOString(),
      })
      .andWhere('i.outcome = :pending', { pending: InterviewOutcome.PENDING })
      .orderBy('i.scheduled_at', 'ASC')
      .take(8)
      .getMany();

    const followUps = applications
      .filter(
        (a) =>
          a.followUpAt &&
          new Date(a.followUpAt) <= inSeven &&
          ![
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.OFFER,
          ].includes(a.status),
      )
      .slice(0, 8);

    const staleCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const stale = applications
      .filter(
        (a) =>
          new Date(a.updatedAt) < staleCutoff &&
          ![
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.OFFER,
            ApplicationStatus.WISHLIST,
          ].includes(a.status),
      )
      .slice(0, 8);

    const recent = applications.slice(0, 6);

    const [companyCount, contactCount, interviewTotal] = await Promise.all([
      this.companies.count({ where: { userId } }),
      this.contacts.count({ where: { userId } }),
      this.interviews.count({ where: { userId } }),
    ]);

    const pipeline = Object.values(ApplicationStatus).map((status) => ({
      status,
      count: byStatus[status] ?? 0,
      items: applications
        .filter((a) => a.status === status)
        .slice(0, 12)
        .map((a) => ({
          id: a.id,
          title: a.title,
          company: a.company?.name ?? '—',
          companyId: a.companyId,
          priority: a.priority,
          location: a.location,
          remote: a.remote,
          salaryMin: a.salaryMin,
          salaryMax: a.salaryMax,
          currency: a.currency,
          updatedAt: a.updatedAt,
        })),
    }));

    return {
      totals: {
        applications: applications.length,
        active,
        companies: companyCount,
        contacts: contactCount,
        interviews: interviewTotal,
        upcomingInterviews: upcomingInterviews.length,
        avgSalary,
      },
      byStatus,
      conversion,
      upcomingInterviews,
      followUps,
      stale,
      recent,
      pipeline,
    };
  }
}
