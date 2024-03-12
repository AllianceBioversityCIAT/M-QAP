import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import {WosQuota} from './wos-quota.entity';

@Entity()
@Unique(['year', 'wosQuota'])
export class WosQuotaYear {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @Column()
    year: number;

    @Column()
    quota: number;

    @ManyToOne(() => WosQuota, (wosQuota) => wosQuota.wosQuotaYear)
    @JoinColumn()
    wosQuota: WosQuota;
}
