import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';
import {PartialType} from '@nestjs/mapped-types';
import {CreateRepositorySchemaDto} from './create-repositorySchema.dto';

export class UpdateRepositorySchemaDto extends PartialType(CreateRepositorySchemaDto) {
    @Expose()
    @IsString()
    target: string;
}
