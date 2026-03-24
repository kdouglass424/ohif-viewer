import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DicomInstanceService } from './dicom-instance.service';
import { CreateDicomInstanceDto } from './dto/create-dicom-instance.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller('orthanc')
@UseGuards(ApiKeyGuard)
export class DicomInstanceController {
  constructor(private readonly dicomInstanceService: DicomInstanceService) {}

  @Post('instances')
  create(@Body() dto: CreateDicomInstanceDto) {
    return this.dicomInstanceService.upsert(dto);
  }
}
