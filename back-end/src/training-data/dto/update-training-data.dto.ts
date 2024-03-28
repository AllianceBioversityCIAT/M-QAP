import {PartialType} from '@nestjs/swagger';
import {CreateTrainingDataDto} from './create-training-data.dto';

export class UpdateTrainingDataDto extends PartialType(CreateTrainingDataDto) {
}
