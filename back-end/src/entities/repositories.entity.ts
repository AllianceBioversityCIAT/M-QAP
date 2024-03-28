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
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class Repositories {
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
    @Column({
        type: 'enum',
        enum: ['DSpace7', 'DSpace6', 'DSpace5', 'Dataverse', 'CKAN'],
    })
    type: string;

    @ApiProperty()
    @Column()
    base_url: string;

    @ApiProperty()
    @Column()
    api_path: string;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: ['DOI', 'Handle'],
    })
    identifier_type: string;

    @ApiProperty()
    @Column()
    prefix: string;

    @ApiProperty({type: () => RepositoriesSchema})
    @JoinTable()
    @OneToMany(() => RepositoriesSchema,
        (RepositoriesSchema) => RepositoriesSchema.repository,
        {
            cascade: true,
        })
    schemas: RepositoriesSchema[];
}
