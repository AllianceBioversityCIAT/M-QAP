import {PartialType} from '@nestjs/mapped-types';
import {Expose, Type} from 'class-transformer';
import {CreateWosQuotaYearDto} from './create-wos-quota-year.dto';
import {WosQuota} from 'src/entities/wos-quota.entity';
import {ApiProperty} from '@nestjs/swagger';

export class UpdateWosQuotaYearDto extends PartialType(CreateWosQuotaYearDto) {
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
