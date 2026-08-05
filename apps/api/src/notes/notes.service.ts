import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly notes: Repository<Note>,
  ) {}

  list(userId: string, applicationId: string) {
    return this.notes.find({
      where: { userId, applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  async get(userId: string, id: string) {
    const note = await this.notes.findOne({ where: { id, userId } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  create(userId: string, applicationId: string, body: string) {
    return this.notes.save(
      this.notes.create({ userId, applicationId, body }),
    );
  }

  async update(userId: string, id: string, body: string) {
    const note = await this.get(userId, id);
    note.body = body;
    return this.notes.save(note);
  }

  async remove(userId: string, id: string) {
    const note = await this.get(userId, id);
    await this.notes.remove(note);
    return { ok: true };
  }
}
