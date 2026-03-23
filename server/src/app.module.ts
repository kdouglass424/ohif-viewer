import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/database.config';
import { StatusModule } from './status/status.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), StatusModule],
})
export class AppModule {}
