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
import {ApiProperty} from '@nestjs/swagger';

@Entity()
@Unique(['year', 'wosQuota'])
export class WosQuotaYear {
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
    year: number;

    @ApiProperty()
    @Column()
    quota: number;

    @ApiProperty({type: () => WosQuota})
    @ManyToOne(() => WosQuota, (wosQuota) => wosQuota.wosQuotaYear)
    @JoinColumn()
    wosQuota: WosQuota;
}
