import {Module} from '@nestjs/common';
import {ApiKeysController} from './api-keys.controller';
import {ApiKeysService} from './api-keys.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ApiKey} from '../entities/api-key.entity';
import {ApiKeyUsage} from '../entities/api-key-usage.entity';
import {ApiKeyWosUsage} from '../entities/api-key-wos-usage.entity';
import {WosQuota} from '../entities/wos-quota.entity';
import {PaginatorService} from '../paginator/paginator.service';
import {WosQuotaYear} from '../entities/wos-quota-year.entity';
import {HttpModule} from '@nestjs/axios';
import {PrivilegesService} from '../auth/privileges.service';
import {EmailsService} from '../emails/emails.service';
import {Email} from '../entities/email.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WosQuota,
            WosQuotaYear,
            ApiKey,
            ApiKeyUsage,
            ApiKeyWosUsage,
            Email
        ]),
        HttpModule
    ],
    controllers: [ApiKeysController],
    providers: [ApiKeysService, ApiKey, PaginatorService, PrivilegesService, EmailsService],
    exports: [ApiKeysService, ApiKey]
})
export class ApiKeysModule {
}
