import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { Interview } from '../interviews/interview.entity';
import { Note } from '../notes/note.entity';
import { DATE_COLUMN } from '../common/column-types';

export enum ApplicationStatus {
  WISHLIST = 'WISHLIST',
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum ApplicationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'company_id' })
  companyId!: string;

  @ManyToOne(() => Company, (c) => c.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Column()
  title!: string;

  @Column({ type: 'varchar', default: ApplicationStatus.WISHLIST })
  status!: ApplicationStatus;

  @Column({ type: 'varchar', default: ApplicationPriority.MEDIUM })
  priority!: ApplicationPriority;

  @Column({ name: 'salary_min', type: 'integer', nullable: true })
  salaryMin?: number | null;

  @Column({ name: 'salary_max', type: 'integer', nullable: true })
  salaryMax?: number | null;

  @Column({ default: 'EUR' })
  currency!: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: false })
  remote!: boolean;

  @Column({ name: 'job_url', nullable: true })
  jobUrl?: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ name: 'applied_at', type: DATE_COLUMN, nullable: true })
  appliedAt?: Date | null;

  @Column({ name: 'follow_up_at', type: DATE_COLUMN, nullable: true })
  followUpAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Interview, (i) => i.application)
  interviews?: Interview[];

  @OneToMany(() => Note, (n) => n.application)
  notes?: Note[];
}
