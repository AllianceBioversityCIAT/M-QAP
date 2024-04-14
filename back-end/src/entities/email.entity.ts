import {ApiProperty} from '@nestjs/swagger';
import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Email {
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
    name: string;

    @ApiProperty()
    @Column()
    subject: string;

    @ApiProperty()
    @Column()
    email: string;

    @ApiProperty()
    @Column('longtext')
    email_body: string;

    @ApiProperty()
    @Column({default: false})
    status: boolean;
}