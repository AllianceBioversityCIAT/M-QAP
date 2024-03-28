import {Expose} from 'class-transformer';
import {IsBoolean, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class UpdateTrainingCycleDto {
    @ApiProperty()
    @Expose()
    @IsString()
    @IsOptional()
    text?: string;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    @IsOptional()
    training_is_completed?: boolean;
}
