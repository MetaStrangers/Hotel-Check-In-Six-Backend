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
  @IsEnum(VeriffSessionUserDocumentIdTypes)
  document_id_type: VeriffSessionUserDocumentIdTypes;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  @Transform(({ value }) => (value ? lodash?.pickBy(value, lodash?.identity) : value))
  extracted_data: {
    [key: string]: any;
  };
}
