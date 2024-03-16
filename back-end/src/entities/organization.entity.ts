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

@Entity()
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @Column()
    name: string;

    @Column({default: null, nullable: true})
    acronym: string;

    @Column()
    code: string;

    @Column({default: null, nullable: true})
    hq_location: string;

    @Column({default: null, nullable: true})
    hq_location_iso_alpha2: string;

    @Column({default: null, nullable: true})
    institution_type: string;

    @Column({default: null, nullable: true})
    institution_type_id: string;

    @Column({default: null, nullable: true})
    website_link: string;

    @OneToOne(() => WosQuota, (wosQuota) => wosQuota.organization)
    wosQuota: WosQuota;

    @OneToMany(() => ApiKey, (apiKey) => apiKey.organization)
    apikey: ApiKey;
}
