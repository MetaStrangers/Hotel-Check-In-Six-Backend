import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

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
}
