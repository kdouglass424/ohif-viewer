import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study } from './study.entity';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [TypeOrmModule.forFeature([Study])],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
