import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { Application } from '../applications/application.entity';
import { Contact } from '../contacts/contact.entity';
import { Interview } from '../interviews/interview.entity';
import { Note } from '../notes/note.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ name: 'target_role', nullable: true })
  targetRole?: string;

  @Column({ name: 'target_location', nullable: true })
  targetLocation?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Company, (c) => c.user)
  companies?: Company[];

  @OneToMany(() => Application, (a) => a.user)
  applications?: Application[];

  @OneToMany(() => Contact, (c) => c.user)
  contacts?: Contact[];

  @OneToMany(() => Interview, (i) => i.user)
  interviews?: Interview[];

  @OneToMany(() => Note, (n) => n.user)
  notes?: Note[];
}
