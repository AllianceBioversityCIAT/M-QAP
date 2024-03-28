import {Expose, Type} from 'class-transformer';
import {Organization} from 'src/entities/organization.entity';
import {User} from 'src/entities/user.entity';
import {WosQuota} from 'src/entities/wos-quota.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateApiKeyDto {
    @ApiProperty({required: false})
    @Expose()
    @Type(() => WosQuota)
    wosQuota: WosQuota;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty({required: false})
    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @ApiProperty({required: false})
    @Expose()
    @Type(() => User)
    user?: User;

    @ApiProperty({required: false})
    @Expose()
    api_key: string;

    @ApiProperty({required: false})
    @Expose()
    is_active: boolean;
}
