import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Organization} from './organization.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class TrainingData {
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
    @Column({unique: true})
    text: string;

    @ApiProperty()
    @Column()
    clarisa_id: number;

    @ApiProperty({type: () => Organization})
    @ManyToOne(() => Organization)
    @JoinColumn({name: 'clarisa_id'})
    clarisa: Organization;

    @ApiProperty()
    @Column()
    source: string;
}
