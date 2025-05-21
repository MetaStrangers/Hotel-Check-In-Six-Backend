import { Injectable } from '@nestjs/common';
import { Company } from 'src/entities';
import { GenericEntityService } from 'src/shared/services';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppLogger } from 'src/shared/customs';

@Injectable()
export class CompaniesService extends GenericEntityService<Company> {
  private readonly logger = new AppLogger(`${this.constructor.name}`);

  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {
    super(companiesRepository);
  }
}
