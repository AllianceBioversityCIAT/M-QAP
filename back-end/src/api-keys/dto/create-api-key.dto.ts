import {Expose, Type} from 'class-transformer';
import {Organization} from 'src/entities/organization.entity';
import {User} from 'src/entities/user.entity';
import {WosQuota} from 'src/entities/wos-quota.entity';

export class CreateApiKeyDto {

    @Expose()
    @Type(() => WosQuota)
    wosQuota: WosQuota;
    @Expose()
    name: string;

    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @Expose()
    @Type(() => User)
    user?: User;

    @Expose()
    api_key: string;

    @Expose()
    is_active: boolean;
}
