import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Sse,
  ParseUUIDPipe,
  MessageEvent,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { StudyService } from './study.service';
import { StudyStatus } from './study.entity';
import { CreateStudyDto } from './dto/create-study.dto';
import { UpdateStudyStatusDto } from './dto/update-study-status.dto';

@Controller('studies')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.studyService.findStudyList({
      status: status as StudyStatus | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.studyService.studyListChanged$.pipe(
      map(() => ({ data: { changed: true } })),
    );
  }

  @Post()
  create(@Body() dto: CreateStudyDto) {
    return this.studyService.create(dto);
  }

  @Get('by-study-instance-uid/:uid')
  findByStudyInstanceUid(@Param('uid') uid: string) {
    return this.studyService.findByStudyInstanceUid(uid);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studyService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudyStatusDto,
  ) {
    return this.studyService.updateStatus(id, dto.status as StudyStatus);
  }
}
