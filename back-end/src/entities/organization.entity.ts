import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {ApiKey} from './api-key.entity';
import {WosQuota} from './wos-quota.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class Organization {
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
    @Column()
    name: string;

    @ApiProperty()
    @Column({default: null, nullable: true})
    acronym: string;

    @ApiProperty()
    @Column()
    code: string;

    @ApiProperty()
    @Column({default: null, nullable: true})
    hq_location: string;

    @ApiProperty()
    @Column({default: null, nullable: true})
    hq_location_iso_alpha2: string;

    @ApiProperty()
    @Column({default: null, nullable: true})
    institution_type: string;

    @ApiProperty()
    @Column({default: null, nullable: true})
    institution_type_id: string;

    @ApiProperty()
    @Column({default: null, nullable: true})
    website_link: string;

    @ApiProperty({type: () => WosQuota})
    @OneToOne(() => WosQuota, (wosQuota) => wosQuota.organization)
    wosQuota: WosQuota;

    @ApiProperty({type: () => ApiKey})
    @OneToMany(() => ApiKey, (apiKey) => apiKey.organization)
    apikey: ApiKey;
}
