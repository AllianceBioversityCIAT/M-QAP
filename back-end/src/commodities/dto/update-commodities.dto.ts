import {PartialType} from '@nestjs/mapped-types';
import {CreateCommoditiesDto} from './create-commodities.dto';

export class UpdateCommoditiesDto extends PartialType(CreateCommoditiesDto) {
}