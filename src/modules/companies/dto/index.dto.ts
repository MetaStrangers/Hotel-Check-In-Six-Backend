import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

@Exclude()
export class PostCompanyBodyDto {
  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.toLowerCase()?.trim() : value,
  )
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Expose()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value?.toUpperCase()?.trim() : value,
  )
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @Transform(({ value }: { value: string }) => (typeof value === 'string' ? value?.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

@Exclude()
export class FindCompaniesQueryDto {
  @Expose()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public readonly page: number;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public readonly per_page: number;
}
