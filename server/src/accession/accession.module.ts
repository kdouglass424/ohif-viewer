import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accession } from './accession.entity';
import { AccessionController } from './accession.controller';
import { AccessionService } from './accession.service';

@Module({
  imports: [TypeOrmModule.forFeature([Accession])],
  controllers: [AccessionController],
  providers: [AccessionService],
  exports: [AccessionService],
})
export class AccessionModule {}
