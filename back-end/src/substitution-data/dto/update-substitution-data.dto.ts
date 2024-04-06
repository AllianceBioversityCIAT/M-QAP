import {PartialType} from '@nestjs/mapped-types';
import {CreateSubstitutionDataDto} from './create-substitution-data.dto';

export class UpdateSubstitutionDataDto extends PartialType(CreateSubstitutionDataDto) {
}
