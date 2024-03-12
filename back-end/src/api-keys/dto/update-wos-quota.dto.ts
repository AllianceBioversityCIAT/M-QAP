import {PartialType} from '@nestjs/mapped-types';
import {Expose, Type} from 'class-transformer';
import {CreateWosQuotaDto} from './create-wos-quota.dto';
import {Organization} from 'src/entities/organization.entity';

export class UpdateWosQuotaDto extends PartialType(CreateWosQuotaDto) {
    @Expose()
    name?: string;

    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @Expose()
    is_active?: boolean;
}
