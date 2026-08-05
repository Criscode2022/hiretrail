import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Application,
  ApplicationPriority,
  ApplicationStatus,
} from './application.entity';

export type ApplicationFilters = {
  status?: ApplicationStatus;
  q?: string;
  companyId?: string;
  priority?: ApplicationPriority;
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
  ) {}

  list(userId: string, filters: ApplicationFilters = {}) {
    const qb = this.apps
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.company', 'company')
      .where('a.user_id = :userId', { userId })
      .orderBy('a.updated_at', 'DESC');

    if (filters.status) {
      qb.andWhere('a.status = :status', { status: filters.status });
    }
    if (filters.priority) {
      qb.andWhere('a.priority = :priority', { priority: filters.priority });
    }
    if (filters.companyId) {
      qb.andWhere('a.company_id = :companyId', { companyId: filters.companyId });
    }
    if (filters.q?.trim()) {
      qb.andWhere(
        '(LOWER(a.title) LIKE :q OR LOWER(company.name) LIKE :q OR LOWER(a.location) LIKE :q)',
        { q: `%${filters.q.trim().toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  async get(userId: string, id: string) {
    const app = await this.apps.findOne({
      where: { id, userId },
      relations: {
        company: true,
        interviews: true,
        notes: true,
      },
      order: {
        notes: { createdAt: 'DESC' },
        interviews: { scheduledAt: 'ASC' },
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  create(
    userId: string,
    data: Partial<Application> & { companyId: string; title: string },
  ) {
    const entity = this.apps.create({
      ...data,
      userId,
      status: data.status ?? ApplicationStatus.WISHLIST,
      priority: data.priority ?? ApplicationPriority.MEDIUM,
      currency: data.currency ?? 'EUR',
      remote: data.remote ?? false,
    });
    return this.apps.save(entity).then((saved) => this.get(userId, saved.id));
  }

  async update(userId: string, id: string, data: Partial<Application>) {
    const app = await this.get(userId, id);
    const { company, interviews, notes, user, ...rest } = data as Application;
    Object.assign(app, rest);
    await this.apps.save(app);
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    const app = await this.apps.findOne({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');
    await this.apps.remove(app);
    return { ok: true };
  }

  async updateStatus(userId: string, id: string, status: ApplicationStatus) {
    const app = await this.get(userId, id);
    app.status = status;
    if (status === ApplicationStatus.APPLIED && !app.appliedAt) {
      app.appliedAt = new Date();
    }
    await this.apps.save(app);
    return this.get(userId, id);
  }
}
