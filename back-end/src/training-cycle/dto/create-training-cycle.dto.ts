import {Expose} from 'class-transformer';
import {IsBoolean, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateTrainingCycleDto {
    @ApiProperty()
    @Expose()
    @IsString()
    text: string;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    training_is_completed?: boolean;
}
