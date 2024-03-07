import {PartialType} from '@nestjs/mapped-types';
import {CreateApiKeyDto} from './create-api-key.dto';
import {Expose} from 'class-transformer';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {
    @Expose()
    api_key: string;

    @Expose()
    is_active: boolean;
}
