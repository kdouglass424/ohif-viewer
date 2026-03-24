import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { Accession, AccessionStatus } from './accession.entity';
import { CreateAccessionDto } from './dto/create-accession.dto';

const VALID_TRANSITIONS: Record<AccessionStatus, AccessionStatus[]> = {
  [AccessionStatus.PENDING]: [AccessionStatus.IN_PROGRESS],
  [AccessionStatus.IN_PROGRESS]: [AccessionStatus.DONE],
  [AccessionStatus.DONE]: [],
};

@Injectable()
export class AccessionService {
  readonly worklistChanged$ = new Subject<void>();

  constructor(
    @InjectRepository(Accession)
    private readonly accessionRepo: Repository<Accession>,
  ) {}

  async create(dto: CreateAccessionDto): Promise<Accession> {
    const accession = this.accessionRepo.create({
      ...dto,
      submittedAt: new Date(),
    });
    const saved = await this.accessionRepo.save(accession);
    this.worklistChanged$.next();
    return saved;
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
    const saved = await this.accessionRepo.save(accession);
    this.worklistChanged$.next();
    return saved;
  }

  async findWorklist(options: {
    status?: AccessionStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Accession[]; total: number }> {
    const qb = this.accessionRepo.createQueryBuilder('a');

    // Default: show pending and in_progress (exclude done)
    if (options.status) {
      qb.where('a.status = :status', { status: options.status });
    } else {
      qb.where('a.status IN (:...statuses)', {
        statuses: [AccessionStatus.PENDING, AccessionStatus.IN_PROGRESS],
      });
    }

    qb.orderBy('a.submittedAt', 'ASC');

    if (options.limit) {
      qb.take(options.limit);
    }
    if (options.offset) {
      qb.skip(options.offset);
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
