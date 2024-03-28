import {Expose, Type} from 'class-transformer';
import {ApiKey} from 'src/entities/api-key.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateApiKeyWosUsageDto {
    @ApiProperty()
    @Expose()
    @Type(() => ApiKey)
    apiKey: ApiKey;

    @ApiProperty()
    @Expose()
    doi: string;
}
