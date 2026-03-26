import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1711234567890 implements MigrationInterface {
  name = 'InitialSchema1711234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "studies_status_enum" AS ENUM('pending', 'reviewed', 'submitted')`,
    );

    await queryRunner.query(`
      CREATE TABLE "studies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studyInstanceUid" text NOT NULL,
        "status" "studies_status_enum" NOT NULL DEFAULT 'pending',
        "receivedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
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
        CONSTRAINT "PK_studies_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_studies_studyInstanceUid" UNIQUE ("studyInstanceUid")
      )
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "studies"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "studies_status_enum"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
