import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {RepositoriesSchema} from './repositories-schema.entity';

@Entity()
export class Repositories {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ['DSpace7', 'DSpace6', 'DSpace5', 'Dataverse', 'CKAN'],
    })
    type: string;

    @Column()
    base_url: string;

    @Column()
    api_path: string;

    @Column({
        type: 'enum',
        enum: ['DOI', 'Handle'],
    })
    identifier_type: string;

    @Column()
    prefix: string;

    @JoinTable()
    @OneToMany(() => RepositoriesSchema,
        (RepositoriesSchema) => RepositoriesSchema.repository,
        {
            cascade: true,
        })
    schemas: RepositoriesSchema[];
}
