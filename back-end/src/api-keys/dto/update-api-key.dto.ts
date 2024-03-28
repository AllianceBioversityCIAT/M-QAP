import {PartialType} from '@nestjs/mapped-types';
import {CreateApiKeyDto} from './create-api-key.dto';
import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {
    @ApiProperty()
    @Expose()
    api_key: string;

    @ApiProperty()
    @Expose()
    is_active: boolean;
}
