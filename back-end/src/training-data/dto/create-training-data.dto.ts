import {Expose, Type} from 'class-transformer';
import {IsString} from 'class-validator';
import {Organization} from 'src/entities/organization.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateTrainingDataDto {
    @ApiProperty()
    @Expose()
    @IsString()
    text: string;

    @ApiProperty()
    @Expose()
    @IsString()
    source: string;

    @ApiProperty()
    @Expose()
    @Type(() => Organization)
    clarisa: Organization;
}
