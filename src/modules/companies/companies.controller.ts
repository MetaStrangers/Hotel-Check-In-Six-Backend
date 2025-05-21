import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FindCompaniesQueryDto, PostCompanyBodyDto } from './dto/index.dto';
import { AppLogger } from 'src/shared/customs';

@Controller('companies')
export class CompaniesController {
  private readonly logger = new AppLogger(this.constructor.name);

  constructor(private readonly companyService: CompaniesService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async findCompanies(@Query() q: FindCompaniesQueryDto) {
    let [companies, count] = await this.companyService.findWithCount({
      where: {},
      relations: {},
      take: q?.per_page,
      skip: q?.per_page * (q?.page - 1),
      order: { created_at: 'DESC' },
    });

    return {
      page: q?.page,
      per_page: q?.per_page,
      count,
      result: companies,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postCompany(@Body() bd: PostCompanyBodyDto) {
    let company = await this.companyService.findOne({
      select: ['id'],
      where: { email: bd?.email },
    });

    if (company) {
      throw new HttpException(`Company with this email already exist!`, HttpStatus.BAD_REQUEST);
    }

    company = await this.companyService.save(bd);

    delete company?.password;

    return {
      result: company,
    };
  }
}
