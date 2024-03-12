import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {ApiKeysService} from './api-keys/api-keys.service';
import {ApiKey} from './entities/api-key.entity';
import {FindOneOptions} from 'typeorm';

@Injectable()
export class AppService {
    constructor(
        private apiKeysService: ApiKeysService
    ) {
    }

    async validateApiKey(apiKey: string, path: string): Promise<ApiKey> {
        apiKey = apiKey ? apiKey.trim() : null;
        if (!apiKey) {
            throw new HttpException(
                'Invalid API-key',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const apiKeyEntity = await this.apiKeysService.findOne({
            where: {
                api_key: apiKey,
                is_active: true,
                wosQuota: {
                    is_active: true,
                    wosQuotaYear: {
                        year: (new Date().getFullYear())
                    },
                },
            },
            relations: ['wosQuota', 'wosQuota.wosQuotaYear']
        } as FindOneOptions);

        if (!apiKeyEntity) {
            throw new HttpException(
                'Invalid API-key',
                HttpStatus.UNAUTHORIZED,
            );
        } else {
            this.apiKeysService.createApiUsage(apiKeyEntity, path);
            return apiKeyEntity;
        }
    }

    async getWosAvailableQuota(apiKeyEntity: ApiKey, year: number) {
        return await this.apiKeysService.getWosAvailableQuota(apiKeyEntity, year);
    }
}
