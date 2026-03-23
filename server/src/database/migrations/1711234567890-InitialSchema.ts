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
        "accessionNumber" character varying NOT NULL,
        "status" "accessions_status_enum" NOT NULL DEFAULT 'pending',
        "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "studyInstanceUid" character varying,
        "patientId" character varying,
        "patientName" character varying,
        "patientSex" character varying,
        "patientDob" date,
        "patientWeight" numeric(10,2),
        "species" character varying,
        "breed" character varying,
        "clientName" character varying,
        "clientId" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_accessions_accessionNumber" UNIQUE ("accessionNumber")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "dicom_instances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orthancId" character varying NOT NULL,
        "sopInstanceUid" character varying,
        "seriesInstanceUid" character varying,
        "studyInstanceUid" character varying,
        "sopClassUid" character varying,
        "s3Key" character varying,
        "modality" character varying,
        "patientId" character varying,
        "patientName" character varying,
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
