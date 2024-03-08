import {Expose, Type} from 'class-transformer';
import {ApiKey} from 'src/entities/api-key.entity';

export class CreateApiKeyWosUsageDto {
    @Expose()
    @Type(() => ApiKey)
    apiKey: ApiKey;

    @Expose()
    doi: string;
}
