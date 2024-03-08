import {Module} from '@nestjs/common';
import {ApiKeysController} from './api-keys.controller';
import {ApiKeysService} from './api-keys.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ApiKey} from '../entities/api-key.entity';
import {ApiKeyUsage} from '../entities/api-key-usage.entity';
import {ApiKeyWosUsage} from '../entities/api-key-wos-usage.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ApiKey, ApiKeyUsage, ApiKeyWosUsage])],
    controllers: [ApiKeysController],
    providers: [ApiKeysService, ApiKey],
    exports: [ApiKeysService, ApiKey]
})
export class ApiKeysModule {
}
