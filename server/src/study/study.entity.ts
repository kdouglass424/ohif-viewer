import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StudyStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SUBMITTED = 'submitted',
}

@Entity('studies')
export class Study {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studyInstanceUid: string;

  @Column({ type: 'enum', enum: StudyStatus, default: StudyStatus.PENDING })
  status: StudyStatus;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  receivedAt: Date;

  // Veterinary patient fields
  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  patientName: string;

  @Column({ nullable: true })
  patientSex: string;

  @Column({ type: 'date', nullable: true })
  patientDob: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  patientWeight: number;

  @Column({ nullable: true })
  species: string;

  @Column({ nullable: true })
  breed: string;

  // Client (pet owner) fields
  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  clientId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
