import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Prediction} from './predictions.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class TrainingCycle {
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
    @Column({default: false})
    training_is_completed: boolean;

    @ApiProperty()
    @Column({default: false})
    is_active: boolean;

    @ApiProperty({type: () => Prediction})
    @OneToMany(() => Prediction, (prediction) => prediction.trainingCycle)
    predictions: Prediction[];
}
