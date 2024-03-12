import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable, ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Organization} from './organization.entity';
import {User} from './user.entity';
import {ApiKeyUsage} from './api-key-usage.entity';
import {ApiKeyWosUsage} from './api-key-wos-usage.entity';
import {WosQuota} from './wos-quota.entity';

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @ManyToOne(() => WosQuota, (wosQuota) => wosQuota.wosQuotaYear, {nullable: false})
    @JoinColumn()
    wosQuota: WosQuota;

    @Column({nullable: true})
    name: string;

    @OneToOne(() => Organization, (organization) => organization.apikey, {nullable: true})
    @JoinColumn()
    organization: Organization;

    @OneToOne(() => User, (user) => user.apikey, {nullable: true})
    @JoinColumn()
    user: User;

    @Column({nullable: false, unique: true})
    api_key: string;

    @Column()
    is_active: boolean;

    @JoinTable()
    @OneToMany(() => ApiKeyUsage,
        (usage) => usage.apiKey,
        {
            cascade: true,
        })
    usage: ApiKeyUsage;

    @JoinTable()
    @OneToMany(() => ApiKeyWosUsage,
        (wosUsage) => wosUsage.apiKey,
        {
            cascade: true,
        })
    wosUsage: ApiKeyWosUsage;
}
