import {PartialType} from '@nestjs/mapped-types';
import {Expose, Type} from 'class-transformer';
import {CreateWosQuotaDto} from './create-wos-quota.dto';
import {Organization} from 'src/entities/organization.entity';
import {ApiProperty} from '@nestjs/swagger';

export class UpdateWosQuotaDto extends PartialType(CreateWosQuotaDto) {
    @ApiProperty()
    @Expose()
    name?: string;

    @ApiProperty()
    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @ApiProperty()
    @Expose()
    is_active?: boolean;

    @ApiProperty()
    @Expose()
    alert_on?: number;
}
