import {Expose} from 'class-transformer';
import {IsBoolean, IsOptional, IsString} from 'class-validator';

export class UpdateTrainingCycleDto {
    @Expose()
    @IsString()
    @IsOptional()
    text?: string;

    @Expose()
    @IsBoolean()
    @IsOptional()
    training_is_completed?: boolean;
}
