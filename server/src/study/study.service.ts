import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { Study, StudyStatus } from './study.entity';
import { CreateStudyDto } from './dto/create-study.dto';

const VALID_TRANSITIONS: Record<StudyStatus, StudyStatus[]> = {
  [StudyStatus.PENDING]: [StudyStatus.REVIEWED, StudyStatus.SUBMITTED],
  [StudyStatus.REVIEWED]: [],
  [StudyStatus.SUBMITTED]: [],
};

@Injectable()
export class StudyService {
  readonly studyListChanged$ = new Subject<void>();

  constructor(
    @InjectRepository(Study)
    private readonly studyRepo: Repository<Study>,
  ) {}

  async create(dto: CreateStudyDto): Promise<Study> {
    const study = this.studyRepo.create(dto);
    const saved = await this.studyRepo.save(study);
    this.studyListChanged$.next();
    return saved;
  }

  async findOrCreate(
    studyInstanceUid: string,
    defaults?: Partial<Study>,
  ): Promise<Study> {
    const existing = await this.studyRepo.findOneBy({ studyInstanceUid });
    if (existing) {
      return existing;
    }
    try {
      const study = this.studyRepo.create({
        studyInstanceUid,
        ...defaults,
      });
      const saved = await this.studyRepo.save(study);
      this.studyListChanged$.next();
      return saved;
    } catch (err) {
      // Handle race condition: concurrent inserts for the same studyInstanceUid
      // will hit the UNIQUE constraint — return the existing record instead
      if (err?.code === '23505') {
        const race = await this.studyRepo.findOneBy({ studyInstanceUid });
        if (race) {
          return race;
        }
      }
      throw err;
    }
  }

  async findOne(id: string): Promise<Study> {
    const study = await this.studyRepo.findOneBy({ id });
    if (!study) {
      throw new NotFoundException(`Study ${id} not found`);
    }
    return study;
  }

  async findByStudyInstanceUid(studyInstanceUid: string): Promise<Study> {
    const study = await this.studyRepo.findOneBy({ studyInstanceUid });
    if (!study) {
      throw new NotFoundException(`Study ${studyInstanceUid} not found`);
    }
    return study;
  }

  async updateStatus(id: string, newStatus: StudyStatus): Promise<Study> {
    const study = await this.findOne(id);
    const allowed = VALID_TRANSITIONS[study.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${study.status} -> ${newStatus}`,
      );
    }
    study.status = newStatus;
    const saved = await this.studyRepo.save(study);
    this.studyListChanged$.next();
    return saved;
  }

  async findStudyList(options: {
    status?: StudyStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Study[]; total: number }> {
    const qb = this.studyRepo.createQueryBuilder('s');

    if (options.status) {
      qb.where('s.status = :status', { status: options.status });
    } else {
      qb.where('s.status = :status', { status: StudyStatus.PENDING });
    }

    qb.orderBy('s.receivedAt', 'ASC');

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
