import { Injectable } from '@nestjs/common';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  FindOptionsWhere,
} from 'typeorm';
import { PickKeysByType } from 'typeorm/common/PickKeysByType';

@Injectable()
export class GenericEntityService<T> {
  constructor(private readonly repository: Repository<T>) {}

  async findOne(options: FindOneOptions<T>) {
    return await this.repository.findOne(options);
  }

  async findWithCount(options: FindManyOptions<T>) {
    return await this.repository.findAndCount(options);
  }

  async find(options: FindManyOptions<T>) {
    return await this.repository.find(options);
  }

  async save(entity: DeepPartial<T>) {
    const entityInstance = this.repository.create(entity);
    return await this.repository.save(entityInstance);
  }

  async saveMultiple(entities: Array<DeepPartial<T>>) {
    return await this.repository.save(entities);
  }

  async count(options: FindManyOptions<T>) {
    return await this.repository.count(options);
  }

  async sum(
    columnName: PickKeysByType<T, number>,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    includeSoftDeleted = false,
  ): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder();
    queryBuilder.select(`SUM(${queryBuilder.alias}.${columnName})`, 'sum');
    if (where) {
      queryBuilder.where(where);
    }
    if (includeSoftDeleted) {
      queryBuilder.withDeleted();
    }
    const result = await queryBuilder.getRawOne<{ sum: string }>();
    const resultSum = parseFloat(result?.sum || '0');
    return resultSum;
  }

  async softDelete(criteria: FindOptionsWhere<T>) {
    return await this.repository.softDelete(criteria);
  }

  async hardDelete(criteria: FindOptionsWhere<T>) {
    return await this.repository.delete(criteria);
  }
}
