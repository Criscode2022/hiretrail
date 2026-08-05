import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private readonly contacts: Repository<Contact>,
  ) {}

  list(userId: string, companyId?: string) {
    const qb = this.contacts
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.company', 'company')
      .where('c.user_id = :userId', { userId })
      .orderBy('c.name', 'ASC');
    if (companyId) qb.andWhere('c.company_id = :companyId', { companyId });
    return qb.getMany();
  }

  async get(userId: string, id: string) {
    const contact = await this.contacts.findOne({
      where: { id, userId },
      relations: { company: true },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  create(userId: string, data: Partial<Contact>) {
    return this.contacts.save(this.contacts.create({ ...data, userId }));
  }

  async update(userId: string, id: string, data: Partial<Contact>) {
    const contact = await this.get(userId, id);
    Object.assign(contact, data);
    return this.contacts.save(contact);
  }

  async remove(userId: string, id: string) {
    const contact = await this.get(userId, id);
    await this.contacts.remove(contact);
    return { ok: true };
  }
}
