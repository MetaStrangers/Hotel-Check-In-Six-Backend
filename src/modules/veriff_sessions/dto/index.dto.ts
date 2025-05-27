import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  id_type: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  id_number: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  person_name: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  document_country: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  date_of_birth?: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  address?: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  issued_date?: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.trim()?.toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  expiry_date?: string;
}
