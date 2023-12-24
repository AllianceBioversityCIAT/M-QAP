import { Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { Commodity } from 'src/entities/commodities.entity';

export class CreateCommoditiesDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  source: string;

  @Expose()
  @Type(() => Commodity)
  parent: Commodity;
}
