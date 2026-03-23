import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(private readonly dataSource: DataSource) {}

  async getStatus() {
    const startTime = process.uptime();
    let database = 'disconnected';

    try {
      await this.dataSource.query('SELECT 1');
      database = 'connected';
    } catch {
      database = 'disconnected';
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
      uptime: Math.floor(startTime),
    };
  }
}
