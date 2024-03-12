import {PartialType} from '@nestjs/mapped-types';
import {Expose, Type} from 'class-transformer';
import {CreateWosQuotaYearDto} from './create-wos-quota-year.dto';
import {WosQuota} from 'src/entities/wos-quota.entity';

export class UpdateWosQuotaYearDto extends PartialType(CreateWosQuotaYearDto) {
    @Expose()
    year?: number;

    @Expose()
    @Type(() => WosQuota)
    wosQuota?: WosQuota;

    @Expose()
    quota: number;
}
