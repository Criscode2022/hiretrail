import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DATE_COLUMN } from '../common/column-types';
import { User } from '../users/user.entity';
import { Application } from '../applications/application.entity';

export enum InterviewType {
  PHONE = 'PHONE',
  VIDEO = 'VIDEO',
  ONSITE = 'ONSITE',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  FINAL = 'FINAL',
  OTHER = 'OTHER',
}

export enum InterviewOutcome {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'application_id' })
  applicationId!: string;

  @ManyToOne(() => Application, (a) => a.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application!: Application;

  @Column({ type: 'varchar', default: InterviewType.VIDEO })
  type!: InterviewType;

  @Column({ name: 'scheduled_at', type: DATE_COLUMN })
  scheduledAt!: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'varchar', default: InterviewOutcome.PENDING })
  outcome!: InterviewOutcome;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
