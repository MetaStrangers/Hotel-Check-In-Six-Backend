import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { VeriffSessionUserDocumentIdTypes } from 'src/shared/enum';
import * as lodash from 'lodash';

@Exclude()
export class FindOneVeriffSessionDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

@Exclude()
export class PutVeriffSessionBodyDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Expose()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsEnum(VeriffSessionUserDocumentIdTypes)
  document_id_type: VeriffSessionUserDocumentIdTypes;

  @Expose()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? lodash?.pickBy(JSON.parse(value), lodash?.identity) : value))
  @IsObject()
  extracted_data: {
    [key: string]: any;
  };
}
