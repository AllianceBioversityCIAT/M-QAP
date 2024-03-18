import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Organization} from './organization.entity';
import {ApiKey} from './api-key.entity';
import {WosQuotaYear} from './wos-quota-year.entity';
import {User} from './user.entity';

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

    @ManyToOne(() => User, (responsible) => responsible.wosQuota)
    @JoinColumn()
    responsible: WosQuota;

    @OneToMany(() => WosQuotaYear, (wosQuotaYear) => wosQuotaYear.wosQuota)
    wosQuotaYear: WosQuotaYear[];

    @Column()
    is_active: boolean;

    @Column()
    alert_on: number;

    @OneToMany(() => ApiKey, (apiKey) => apiKey.wosQuota)
    apiKey: ApiKey[];
}
