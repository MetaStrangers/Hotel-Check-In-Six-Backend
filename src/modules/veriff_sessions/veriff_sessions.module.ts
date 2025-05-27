import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeriffSession } from 'src/entities';
import { VeriffSessionsController } from './veriff_sessions.controller';
import { VeriffSessionsService } from './veriff_sessions.service';
import { MulterModule } from '@nestjs/platform-express';
import * as os from 'os';
import { CloudinaryService } from 'src/shared/services';
import { VeriffSessionDataService } from 'src/shared/services/entities';
import { DocumentExtractionService } from 'src/shared/services/document-extraction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VeriffSession]),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: `${os?.tmpdir()}`,
      }),
    }),
  ],
  controllers: [VeriffSessionsController],
  providers: [
    VeriffSessionsService,
    CloudinaryService,
    VeriffSessionDataService,
    DocumentExtractionService,
  ],
  exports: [VeriffSessionsService],
})
export class VeriffSessionsModule {}
