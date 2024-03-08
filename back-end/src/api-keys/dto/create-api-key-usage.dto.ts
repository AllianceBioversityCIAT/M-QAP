import {Expose, Type} from 'class-transformer';
import {ApiKey} from 'src/entities/api-key.entity';

export class CreateApiKeyUsageDto {
    @Expose()
    @Type(() => ApiKey)
    apiKey: ApiKey;

    @Expose()
    path: string;
}
