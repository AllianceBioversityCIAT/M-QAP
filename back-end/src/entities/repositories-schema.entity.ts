import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {Repositories} from './repositories.entity';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class RepositoriesSchema {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({type: () => Repositories})
    @ManyToOne(() => Repositories, (Repositories) => Repositories.schemas, {
        onDelete: 'CASCADE',
    })
    repository: Repositories;

    @ApiProperty()
    @Column()
    source: string;

    @ApiProperty()
    @Column()
    target: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: ['date', 'datetime', 'country', 'language', 'combine', 'split'],
        nullable: true
    })
    formatter: string;

    @ApiProperty()
    @Column({nullable: true})
    formatter_addition: string;
}
