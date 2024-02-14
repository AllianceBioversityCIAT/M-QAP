import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Prediction } from './predictions.entity';

@Entity()
export class TrainingCycle {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creation_date: string;

  @UpdateDateColumn()
  update_date: string;

  @Column()
  text: string;

  @Column({default: false})
  training_is_completed: boolean;

  @OneToMany(() => Prediction, (prediction) => prediction.trainingCycle)
  predictions: Prediction[];
}
