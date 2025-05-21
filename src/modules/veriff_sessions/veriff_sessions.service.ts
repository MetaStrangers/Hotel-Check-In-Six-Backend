import { Injectable } from '@nestjs/common';
import { VeriffSession } from 'src/entities';
import { GenericEntityService } from 'src/shared/services';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppLogger } from 'src/shared/customs';

@Injectable()
export class VeriffSessionsService extends GenericEntityService<VeriffSession> {
  private readonly logger = new AppLogger(`${this.constructor.name}`);

  constructor(
    @InjectRepository(VeriffSession)
    private readonly veriffSessionsRepository: Repository<VeriffSession>,
  ) {
    super(veriffSessionsRepository);
  }
}
