import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

@Entity('accessions')
export class Accession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accessionNumber: string;

  @Column({ type: 'enum', enum: AccessionStatus, default: AccessionStatus.PENDING })
  status: AccessionStatus;

  @Column({ type: 'timestamptz' })
  submittedAt: Date;

  @Column({ nullable: true })
  studyInstanceUid: string;

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
