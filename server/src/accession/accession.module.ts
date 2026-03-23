import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accession } from './accession.entity';
import { AccessionController } from './accession.controller';
import { WorklistController } from './worklist.controller';
import { AccessionService } from './accession.service';

@Module({
  imports: [TypeOrmModule.forFeature([Accession])],
  controllers: [AccessionController, WorklistController],
  providers: [AccessionService],
  exports: [AccessionService],
})
export class AccessionModule {}
