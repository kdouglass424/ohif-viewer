import { Controller, Get, Query, Sse, MessageEvent } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AccessionService } from './accession.service';
import { AccessionStatus } from './accession.entity';

@Controller('worklist')
export class WorklistController {
  constructor(private readonly accessionService: AccessionService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.accessionService.findWorklist({
      status: status as AccessionStatus | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.accessionService.worklistChanged$.pipe(
      map(() => ({ data: { changed: true } })),
    );
  }
}
