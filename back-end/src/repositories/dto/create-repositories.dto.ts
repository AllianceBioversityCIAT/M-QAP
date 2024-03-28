import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateRepositoriesDto {
    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    type: string;

    @ApiProperty()
    @Expose()
    @IsString()
    base_url: string;

    @ApiProperty()
    @Expose()
    @IsString()
    api_path: string;

    @ApiProperty()
    @Expose()
    @IsString()
    identifier_type: string;

    @ApiProperty()
    @Expose()
    @IsString()
    prefix: string;
}
