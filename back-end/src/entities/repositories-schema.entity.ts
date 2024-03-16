import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {Repositories} from './repositories.entity';

@Entity()
export class RepositoriesSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Repositories, (Repositories) => Repositories.schemas, {
        onDelete: 'CASCADE',
    })
    repository: Repositories;

    @Column()
    source: string;

    @Column()
    target: string;

    @Column({
        type: 'enum',
        enum: ['date', 'datetime', 'country', 'language', 'combine', 'split'],
        nullable: true
    })
    formatter: string;

    @Column({nullable: true})
    formatter_addition: string;
}
