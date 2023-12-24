import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class UpdateTrainingCycleDto {
  @Expose()
  @IsString()
  text: string;
}
