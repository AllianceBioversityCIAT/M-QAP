import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import {ApiKey} from './api-key.entity';
import {WosQuota} from "./wos-quota.entity";

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

    @OneToOne(() => WosQuota, (wosQuota) => wosQuota.organization)
    @JoinColumn()
    wosQuota: WosQuota;

    @OneToOne(() => ApiKey, (apiKey) => apiKey.organization)
    apikey: ApiKey;
}
