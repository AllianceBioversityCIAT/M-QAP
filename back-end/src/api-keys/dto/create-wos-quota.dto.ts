import {Expose, Type} from 'class-transformer';
import {Organization} from 'src/entities/organization.entity';

export class CreateWosQuotaDto {
    @Expose()
    name?: string;

    @Expose()
    @Type(() => Organization)
    organization?: Organization;

    @Expose()
    is_active: boolean;

    @Expose()
    alert_on: number;
}
