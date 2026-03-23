import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('dicom_instances')
export class DicomInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orthancId: string;

  @Column({ nullable: true })
  sopInstanceUid: string;

  @Column({ nullable: true })
  seriesInstanceUid: string;

  @Column({ nullable: true })
  studyInstanceUid: string;

  @Column({ nullable: true })
  sopClassUid: string;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  modality: string;

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  patientName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  receivedAt: Date;
}
