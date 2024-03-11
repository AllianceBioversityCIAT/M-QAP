import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {ApiKey} from './api-key.entity';

@Entity()
export class ApiKeyUsage {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: Date;

    @ManyToOne(() => ApiKey, (apiKey) => apiKey.id)
    apiKey: ApiKey;

    @Column()
    path: string;
}
