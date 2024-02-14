import { Expose } from 'class-transformer';
import {IsBoolean, IsString} from 'class-validator';

export class CreateTrainingCycleDto {
  @Expose()
  @IsString()
  text: string;

  @Expose()
  @IsBoolean()
  training_is_completed?: boolean;
}
