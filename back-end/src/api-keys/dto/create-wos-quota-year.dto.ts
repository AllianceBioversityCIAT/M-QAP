import {Expose, Type} from 'class-transformer';
import {WosQuota} from 'src/entities/wos-quota.entity';

export class CreateWosQuotaYearDto {
    @Expose()
    year?: number;

    @Expose()
    @Type(() => WosQuota)
    wosQuota?: WosQuota;

    @Expose()
    quota: number;
}
