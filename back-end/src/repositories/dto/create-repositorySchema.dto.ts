import {Expose} from 'class-transformer';
import {IsNumber, IsString} from 'class-validator';
import {Repositories} from '../../entities/repositories.entity';

export class CreateRepositorySchemaDto {
    @Expose()
    @IsNumber()
    repository: Repositories;

    @Expose()
    @IsString()
    source: string;

    @Expose()
    @IsString()
    target: string;
}
