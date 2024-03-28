import {Expose, Type} from 'class-transformer';
import {Organization} from 'src/entities/organization.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateWosQuotaDto {
    @ApiProperty()
    @Expose()
    name?: string;

    @ApiProperty()
    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @ApiProperty()
    @Expose()
    is_active: boolean;

    @ApiProperty()
    @Expose()
    alert_on: number;
}
