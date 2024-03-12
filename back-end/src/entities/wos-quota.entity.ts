import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Organization} from './organization.entity';
import {ApiKey} from './api-key.entity';
import {WosQuotaYear} from './wos-quota-year.entity';

@Entity()
export class WosQuota {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @Column({unique: true})
    name: string;

    @ManyToOne(() => Organization, (organization) => organization.id, {nullable: true})
    organization: Organization;

    @OneToMany(() => WosQuotaYear, (wosQuotaYear) => wosQuotaYear.wosQuota)
    wosQuotaYear: WosQuotaYear;

    @Column()
    is_active: boolean;

    @OneToMany(() => ApiKey, (apiKey) => apiKey.wosQuota)
    apiKey: ApiKey;
}
