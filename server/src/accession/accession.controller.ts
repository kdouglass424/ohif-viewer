import { Controller, Post, Get, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { AccessionService } from './accession.service';
import { AccessionStatus } from './accession.entity';
import { CreateAccessionDto } from './dto/create-accession.dto';
import { UpdateAccessionStatusDto } from './dto/update-accession-status.dto';

@Controller('accessions')
export class AccessionController {
  constructor(private readonly accessionService: AccessionService) {}

  @Post()
  create(@Body() dto: CreateAccessionDto) {
    return this.accessionService.create(dto);
  }

  @Get('by-accession-number/:accessionNumber')
  findByAccessionNumber(@Param('accessionNumber') accessionNumber: string) {
    return this.accessionService.findByAccessionNumber(accessionNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accessionService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccessionStatusDto,
  ) {
    return this.accessionService.updateStatus(id, dto.status as AccessionStatus);
  }
}
