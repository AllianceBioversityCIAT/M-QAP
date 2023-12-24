import { Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { Organization } from 'src/entities/organization.entity';

export class CreateTrainingDataDto {
  @Expose()
  @IsString()
  text: string;

  @Expose()
  @IsString()
  source: string;

  @Expose()
  @Type(() => Organization)
  clarisa: Organization;
}
