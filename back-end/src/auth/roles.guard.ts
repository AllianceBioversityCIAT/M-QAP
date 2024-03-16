import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ROLES_KEY, RoleObject} from './roles.decorator';
import {DataSource} from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private reflector: Reflector,
        private dataSource: DataSource
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const rolesObject = this.reflector.getAllAndOverride<RoleObject>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!rolesObject.role && !rolesObject.responsibility) {
            return true;
        }
        const request = context.switchToHttp().getRequest();

        const user: any = request.user;

        if (rolesObject.role) {
            if (rolesObject.role.some(requiredRole => user.role === requiredRole)) {
                return true;
            }
        }

        if (rolesObject.responsibility) {
            const hasResponsibility = await this.checkMyResponsibilities(user.id, rolesObject.responsibility);
            if (hasResponsibility) {
                return true;
            }
        }
    }

    async checkMyResponsibilities(userId: number, responsibilities: string[]) {
        if (responsibilities.indexOf('quotaResponsible') !== -1) {
            const hasResponsibility = await this.dataSource
                .createQueryBuilder()
                .from('wos_quota', 'wos_quota')
                .select([
                    'wos_quota.id AS id',
                ])
                .where('wos_quota.responsible_id = :userId', {userId})
                .getCount();
            if (hasResponsibility) {
                return true;
            }
        }

        return false;
    }
}
