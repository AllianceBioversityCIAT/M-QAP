import { type } from 'os';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TrainingCycle } from './training-cycle.entity';
import { Organization } from './organization.entity';

@Entity()
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creation_date: string;

  @UpdateDateColumn()
  update_date: string;

  @Column()
  text: string;

  @Column()
  clarisa_id: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'clarisa_id' })
  clarisa: Organization;

  @Column({ type: 'float' })
  confidant: number;

  @ManyToOne(() => TrainingCycle, (trainingCycle) => trainingCycle.predictions)
  trainingCycle: TrainingCycle;
}
