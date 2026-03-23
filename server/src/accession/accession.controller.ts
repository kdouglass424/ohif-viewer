import { Controller, Post, Get, Patch, Param, Body, UsePipes, ParseUUIDPipe } from '@nestjs/common';
import { AccessionService } from './accession.service';
import { AccessionStatus } from './accession.entity';
import { CreateAccessionSchema, CreateAccessionDto } from './dto/create-accession.dto';
import { UpdateAccessionStatusSchema, UpdateAccessionStatusDto } from './dto/update-accession-status.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('accessions')
export class AccessionController {
  constructor(private readonly accessionService: AccessionService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccessionSchema))
  create(@Body() dto: CreateAccessionDto) {
    return this.accessionService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accessionService.findOne(id);
  }

  @Patch(':id/status')
  @UsePipes(new ZodValidationPipe(UpdateAccessionStatusSchema))
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccessionStatusDto,
  ) {
    return this.accessionService.updateStatus(id, dto.status as AccessionStatus);
  }
}
