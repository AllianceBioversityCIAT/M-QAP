import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {ApiKey} from './api-key.entity';

export enum userRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @Column()
    email: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({type: 'enum', enum: userRole})
    role: userRole;

    @Column({
        type: 'varchar',
        generatedType: 'STORED',
        asExpression: `Concat_WS(' ', TRIM(first_name), TRIM(last_name))`,
    })
    full_name: string;

    @OneToOne(() => ApiKey, (apiKey) => apiKey.user)
    apikey: ApiKey;
}
