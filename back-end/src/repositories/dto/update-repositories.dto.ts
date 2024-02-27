import { PartialType } from '@nestjs/mapped-types';
import { CreateRepositoriesDto } from './create-repositories.dto';

export class UpdateRepositoriesDto extends PartialType(CreateRepositoriesDto) {}

