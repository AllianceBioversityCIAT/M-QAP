import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {TrainingCycle} from './training-cycle.entity';
import {Organization} from './organization.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class Prediction {
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
    text: string;

    @ApiProperty()
    @Column()
    clarisa_id: number;

    @ApiProperty({type: () => Organization})
    @ManyToOne(() => Organization)
    @JoinColumn({name: 'clarisa_id'})
    clarisa: Organization;

    @ApiProperty()
    @Column({type: 'float'})
    confidant: number;

    @ApiProperty({type: () => TrainingCycle})
    @ManyToOne(() => TrainingCycle, (trainingCycle) => trainingCycle.predictions)
    trainingCycle: TrainingCycle;
}
