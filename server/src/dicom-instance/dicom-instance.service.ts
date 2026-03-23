import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DicomInstance } from './dicom-instance.entity';
import { CreateDicomInstanceDto } from './dto/create-dicom-instance.dto';

@Injectable()
export class DicomInstanceService {
  constructor(
    @InjectRepository(DicomInstance)
    private readonly instanceRepo: Repository<DicomInstance>,
  ) {}

  async upsert(dto: CreateDicomInstanceDto): Promise<DicomInstance> {
    const existing = await this.instanceRepo.findOneBy({ orthancId: dto.orthancId });
    if (existing) {
      Object.assign(existing, dto);
      return this.instanceRepo.save(existing);
    }
    const instance = this.instanceRepo.create(dto);
    return this.instanceRepo.save(instance);
  }
}
