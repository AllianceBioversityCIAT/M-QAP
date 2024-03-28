import {Expose} from 'class-transformer';
import {IsNumber, IsString} from 'class-validator';
import {Repositories} from '../../entities/repositories.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateRepositorySchemaDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    repository: Repositories;

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
