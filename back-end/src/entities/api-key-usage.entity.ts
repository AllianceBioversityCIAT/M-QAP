import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {ApiKey} from './api-key.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class ApiKeyUsage {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @CreateDateColumn()
    creation_date: Date;

    @ApiProperty({type: () => ApiKey})
    @ManyToOne(() => ApiKey, (apiKey) => apiKey.id)
    apiKey: ApiKey;

    @ApiProperty()
    @Column()
    path: string;
}
