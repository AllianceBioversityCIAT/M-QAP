import {Expose, Type} from 'class-transformer';
import {Organization} from 'src/entities/organization.entity';
import {User} from 'src/entities/user.entity';

export class CreateApiKeyDto {
    @Expose()
    name?: string;

    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @Expose()
    @Type(() => User)
    user?: User;

    @Expose()
    quota: number;

    @Expose()
    api_key: string;

    @Expose()
    is_active: boolean;
}
