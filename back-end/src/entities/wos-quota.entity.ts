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
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class WosQuota {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @CreateDateColumn()
    creation_date: string;

    @ApiProperty()
    @UpdateDateColumn()
    update_date: string;

    @ApiProperty()
    @Column({unique: true})
    name: string;

    @ApiProperty({type: () => Organization})
    @ManyToOne(() => Organization, (organization) => organization.id, {nullable: true})
    organization: Organization;

    @ApiProperty({type: () => WosQuota})
    @ManyToOne(() => User, (responsible) => responsible.wosQuota)
    @JoinColumn()
    responsible: User;

    @ApiProperty({type: () => WosQuotaYear})
    @OneToMany(() => WosQuotaYear, (wosQuotaYear) => wosQuotaYear.wosQuota)
    wosQuotaYear: WosQuotaYear[];

    @ApiProperty()
    @Column()
    is_active: boolean;

    @ApiProperty()
    @Column()
    alert_on: number;

    @ApiProperty({type: () => ApiKey})
    @OneToMany(() => ApiKey, (apiKey) => apiKey.wosQuota)
    apiKey: ApiKey[];
}
