import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Commodity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  creation_date: string;

  @UpdateDateColumn()
  update_date: string;

  @Column({ unique: true })
  name: string;

  @Column()
  source: string;

  @Column({ nullable: true })
  parent_id?: number;

  @ManyToOne(() => Commodity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Commodity;
}
