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

    @ManyToOne(() => Repositories, (Repositories) => Repositories.schemas)
    repository: Repositories;

    @Column()
    source: string;

    @Column()
    target: string;
}
