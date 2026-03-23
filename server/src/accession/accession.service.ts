import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accession, AccessionStatus } from './accession.entity';
import { CreateAccessionDto } from './dto/create-accession.dto';

const VALID_TRANSITIONS: Record<AccessionStatus, AccessionStatus[]> = {
  [AccessionStatus.PENDING]: [AccessionStatus.IN_PROGRESS],
  [AccessionStatus.IN_PROGRESS]: [AccessionStatus.DONE],
  [AccessionStatus.DONE]: [],
};

@Injectable()
export class AccessionService {
  constructor(
    @InjectRepository(Accession)
    private readonly accessionRepo: Repository<Accession>,
  ) {}

  async create(dto: CreateAccessionDto): Promise<Accession> {
    const accession = this.accessionRepo.create({
      ...dto,
      submittedAt: new Date(),
    });
    return this.accessionRepo.save(accession);
  }

  async findOne(id: string): Promise<Accession> {
    const accession = await this.accessionRepo.findOneBy({ id });
    if (!accession) {
      throw new NotFoundException(`Accession ${id} not found`);
    }
    return accession;
  }

  async updateStatus(id: string, newStatus: AccessionStatus): Promise<Accession> {
    const accession = await this.findOne(id);
    const allowed = VALID_TRANSITIONS[accession.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${accession.status} -> ${newStatus}`,
      );
    }
    accession.status = newStatus;
    return this.accessionRepo.save(accession);
  }
}
