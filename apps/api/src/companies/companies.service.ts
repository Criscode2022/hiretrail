import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private readonly companies: Repository<Company>,
  ) {}

  list(userId: string, q?: string) {
    const qb = this.companies
      .createQueryBuilder('c')
      .where('c.user_id = :userId', { userId })
      .orderBy('c.name', 'ASC');
    if (q?.trim()) {
      qb.andWhere('(LOWER(c.name) LIKE :q OR LOWER(c.industry) LIKE :q)', {
        q: `%${q.trim().toLowerCase()}%`,
      });
    }
    return qb.getMany();
  }

  async get(userId: string, id: string) {
    const company = await this.companies.findOne({ where: { id, userId } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  create(
    userId: string,
    data: Partial<Pick<Company, 'name' | 'website' | 'industry' | 'location' | 'notes'>>,
  ) {
    const company = this.companies.create({ ...data, userId });
    return this.companies.save(company);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<Pick<Company, 'name' | 'website' | 'industry' | 'location' | 'notes'>>,
  ) {
    const company = await this.get(userId, id);
    Object.assign(company, data);
    return this.companies.save(company);
  }

  async remove(userId: string, id: string) {
    const company = await this.get(userId, id);
    await this.companies.remove(company);
    return { ok: true };
  }
}
