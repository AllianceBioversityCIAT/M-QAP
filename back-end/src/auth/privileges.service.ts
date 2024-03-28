import {Injectable} from '@nestjs/common';
import {User} from '../entities/user.entity';
import {DataSource} from 'typeorm';

export interface AuthenticatedRequest extends Request {
    user?: User;
}

@Injectable()
export class PrivilegesService {
    constructor(private dataSource: DataSource) {
    }

    isAdmin(request: AuthenticatedRequest) {
        return request?.user?.role === 'admin';
    }

    isUser(request: AuthenticatedRequest) {
        return request?.user?.role === 'user';
    }

    async canManageApiKey(request: AuthenticatedRequest, wosQuotaId?: number, apiKeyId?: number) {
        if (this.isAdmin(request)) {
            return true;
        }

        if (!wosQuotaId && !apiKeyId) {
            return false;
        }

        if (wosQuotaId) {
            const queryBuilder = this.dataSource
                .createQueryBuilder()
                .from('wos_quota', 'wos_quota')
                .select([
                    'wos_quota.id AS id',
                ])
                .where('wos_quota.id = :wosQuotaId', {wosQuotaId})
                .andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: request.user.id});
            return (await queryBuilder.getCount()) > 0;
        } else if (apiKeyId) {
            const queryBuilder = this.dataSource
                .createQueryBuilder()
                .from('api_key', 'api_key')
                .select([
                    'api_key.id AS id',
                ])
                .innerJoin('wos_quota', 'wos_quota', 'wos_quota.id = api_key.wos_quota_id')
                .where('api_key.id = :apiKeyId', {apiKeyId})
                .andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: request.user.id});
            return (await queryBuilder.getCount()) > 0;
        }
    }
}
