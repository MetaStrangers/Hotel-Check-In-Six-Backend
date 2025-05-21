import { Injectable } from '@nestjs/common';
import { VeriffSessionData } from 'src/entities';
import { AppLogger } from 'src/shared/customs';
import { GenericEntityService } from 'src/shared/services';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class VeriffSessionDataService extends GenericEntityService<VeriffSessionData> {
  private readonly logger = new AppLogger(`${this.constructor.name}`);
  private readonly veriffSessionDataRepository: Repository<VeriffSessionData>;
  constructor(private readonly dataSource: DataSource) {
    const temp = dataSource.getRepository(VeriffSessionData);
    super(temp);
    this.veriffSessionDataRepository = temp;
  }
}
