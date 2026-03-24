import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1711234567890 implements MigrationInterface {
  name = 'InitialSchema1711234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "accessions_status_enum" AS ENUM('pending', 'in_progress', 'done')`,
    );

    await queryRunner.query(`
      CREATE TABLE "accessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "accessionNumber" text NOT NULL,
        "status" "accessions_status_enum" NOT NULL DEFAULT 'pending',
        "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "studyInstanceUid" text,
        "patientId" text,
        "patientName" text,
        "patientSex" text,
        "patientDob" date,
        "patientWeight" numeric(10,2),
        "species" text,
        "breed" text,
        "clientName" text,
        "clientId" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_accessions_accessionNumber" UNIQUE ("accessionNumber")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "dicom_instances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orthancId" text NOT NULL,
        "sopInstanceUid" text,
        "seriesInstanceUid" text,
        "studyInstanceUid" text,
        "sopClassUid" text,
        "s3Key" text,
        "modality" text,
        "patientId" text,
        "patientName" text,
        "accessionNumber" text,
        "receivedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dicom_instances_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dicom_instances_orthancId" UNIQUE ("orthancId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "dicom_instances"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "accessions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "accessions_status_enum"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
