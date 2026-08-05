import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Interview } from './interview.entity';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviews: Repository<Interview>,
  ) {}

  list(userId: string, applicationId?: string, upcoming?: boolean) {
    const qb = this.interviews
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.application', 'application')
      .leftJoinAndSelect('application.company', 'company')
      .where('i.user_id = :userId', { userId })
      .orderBy('i.scheduled_at', 'ASC');

    if (applicationId) {
      qb.andWhere('i.application_id = :applicationId', { applicationId });
    }
    if (upcoming) {
      qb.andWhere('i.scheduled_at >= :now', { now: new Date().toISOString() });
    }
    return qb.getMany();
  }

  async get(userId: string, id: string) {
    const interview = await this.interviews.findOne({
      where: { id, userId },
      relations: {
        application: { company: true },
      },
    });
    if (!interview) throw new NotFoundException('Interview not found');
    return interview;
  }

  create(
    userId: string,
    data: Partial<Interview> & { applicationId: string; scheduledAt: Date },
  ) {
    return this.interviews.save(this.interviews.create({ ...data, userId }));
  }

  async update(userId: string, id: string, data: Partial<Interview>) {
    const interview = await this.get(userId, id);
    Object.assign(interview, data);
    return this.interviews.save(interview);
  }

  async remove(userId: string, id: string) {
    const interview = await this.get(userId, id);
    await this.interviews.remove(interview);
    return { ok: true };
  }

  countUpcoming(userId: string) {
    return this.interviews.count({
      where: {
        userId,
        scheduledAt: MoreThanOrEqual(new Date()),
      },
    });
  }
}
