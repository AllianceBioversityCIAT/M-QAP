import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ type: 'enum', enum: userRole })
  role: userRole;

  @Column({
    type: 'varchar',
    generatedType: 'STORED',
    asExpression: `Concat_WS(' ', TRIM(first_name), TRIM(last_name))`,
  })
  full_name: string;
}
