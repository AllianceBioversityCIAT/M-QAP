import {Expose, Type} from 'class-transformer';
import {WosQuota} from 'src/entities/wos-quota.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateWosQuotaYearDto {
    @ApiProperty()
    @Expose()
    year?: number;

    @ApiProperty()
    @Expose()
    @Type(() => WosQuota)
    wosQuota?: WosQuota;

    @ApiProperty()
    @Expose()
    quota: number;
}
