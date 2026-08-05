import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
  }) {
    const user = this.users.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
    });
    return this.users.save(user);
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<User, 'name' | 'title' | 'targetRole' | 'targetLocation'>>,
  ) {
    await this.users.update(id, data);
    return this.findById(id);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      title: user.title ?? null,
      targetRole: user.targetRole ?? null,
      targetLocation: user.targetLocation ?? null,
      createdAt: user.createdAt,
    };
  }
}
