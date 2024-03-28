import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';
import {PartialType} from '@nestjs/mapped-types';
import {CreateRepositorySchemaDto} from './create-repositorySchema.dto';
import {ApiProperty} from '@nestjs/swagger';

export class UpdateRepositorySchemaDto extends PartialType(CreateRepositorySchemaDto) {
    @ApiProperty()
    @Expose()
    @IsString()
    source: string;

    @ApiProperty()
    @Expose()
    @IsString()
    target: string;

    @ApiProperty()
    @Expose()
    @IsString()
    formatter: string;

    @ApiProperty()
    @Expose()
    @IsString()
    formatter_addition: string;
}
