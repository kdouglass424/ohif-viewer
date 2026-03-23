import { Controller, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { DicomInstanceService } from './dicom-instance.service';
import { CreateDicomInstanceSchema, CreateDicomInstanceDto } from './dto/create-dicom-instance.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller('orthanc')
@UseGuards(ApiKeyGuard)
export class DicomInstanceController {
  constructor(private readonly dicomInstanceService: DicomInstanceService) {}

  @Post('instances')
  @UsePipes(new ZodValidationPipe(CreateDicomInstanceSchema))
  create(@Body() dto: CreateDicomInstanceDto) {
    return this.dicomInstanceService.upsert(dto);
  }
}
