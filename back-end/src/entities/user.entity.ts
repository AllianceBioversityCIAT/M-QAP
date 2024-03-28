import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {ApiKey} from './api-key.entity';
import {WosQuota} from './wos-quota.entity';
import {ApiProperty} from '@nestjs/swagger';

export enum userRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity()
export class User {
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
    email: string;

    @ApiProperty()
    @Column()
    first_name: string;

    @ApiProperty()
    @Column()
    last_name: string;

    @ApiProperty()
    @Column({type: 'enum', enum: userRole})
    role: userRole;

    @ApiProperty()
    @Column({
        type: 'varchar',
        generatedType: 'STORED',
        asExpression: `Concat_WS(' ', TRIM(first_name), TRIM(last_name))`,
    })
    full_name: string;

    @ApiProperty({type: () => WosQuota})
    @OneToMany(() => WosQuota, (wosQuota) => wosQuota.responsible)
    wosQuota: WosQuota;

    @ApiProperty({type: () => ApiKey})
    @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
    apikey: ApiKey;
}
