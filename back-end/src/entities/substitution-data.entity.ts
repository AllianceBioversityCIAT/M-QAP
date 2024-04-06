import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';

@Unique(['find_text', 'replace_text'])
@Entity()
export class SubstitutionData {
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
    find_text: string;

    @ApiProperty()
    @Column()
    replace_text: string;
}
