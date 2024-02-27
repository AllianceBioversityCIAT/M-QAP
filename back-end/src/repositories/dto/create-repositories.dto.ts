import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';

export class CreateRepositoriesDto {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsString()
    type: string;

    @Expose()
    @IsString()
    base_url: string;

    @Expose()
    @IsString()
    api_path: string;

    @Expose()
    @IsString()
    identifier_type: string;

    @Expose()
    @IsString()
    prefix: string;
}
