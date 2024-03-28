import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Organization} from './organization.entity';
import {User} from './user.entity';
import {ApiKeyUsage} from './api-key-usage.entity';
import {ApiKeyWosUsage} from './api-key-wos-usage.entity';
import {WosQuota} from './wos-quota.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class ApiKey {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @CreateDateColumn()
    creation_date: string;

    @ApiProperty()
    @UpdateDateColumn()
    update_date: string;

    @ApiProperty({type: () => WosQuota})
    @ManyToOne(() => WosQuota, (wosQuota) => wosQuota.wosQuotaYear, {nullable: false})
    @JoinColumn()
    wosQuota: WosQuota;

    @ApiProperty()
    @Column({nullable: true})
    name: string;

    @ApiProperty({type: () => Organization})
    @ManyToOne(() => Organization, (organization) => organization.apikey, {nullable: true})
    @JoinColumn()
    organization: Organization;

    @ApiProperty({type: () => User})
    @ManyToOne(() => User, (user) => user.apikey, {nullable: true})
    @JoinColumn()
    user: User;

    @ApiProperty()
    @Column({nullable: false, unique: true})
    api_key: string;

    @ApiProperty()
    @Column()
    is_active: boolean;

    @ApiProperty({type: () => ApiKeyUsage})
    @JoinTable()
    @OneToMany(() => ApiKeyUsage,
        (usage) => usage.apiKey,
        {
            cascade: true,
        })
    usage: ApiKeyUsage;

    @ApiProperty({type: () => ApiKeyWosUsage})
    @JoinTable()
    @OneToMany(() => ApiKeyWosUsage,
        (wosUsage) => wosUsage.apiKey,
        {
            cascade: true,
        })
    wosUsage: ApiKeyWosUsage;
}
