import {Injectable} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {Repositories} from 'src/entities/repositories.entity';
import {RepositoriesSchema} from 'src/entities/repositories-schema.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {FindOneOptions, In, Not, Repository} from 'typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {CreateRepositoriesDto} from './dto/create-repositories.dto';
import {UpdateRepositoriesDto} from './dto/update-repositories.dto';
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions';
import {CreateRepositorySchemaDto} from './dto/create-repositorySchema.dto';
import {UpdateRepositorySchemaDto} from './dto/update-repositorySchema.dto';

@Injectable()
export class RepositoriesService extends TypeOrmCrudService<Repositories> {
    constructor(
        @InjectRepository(Repositories)
        public repositoriesRepository: Repository<Repositories>,
        @InjectRepository(RepositoriesSchema)
        public RepositoriesSchemaRepository: Repository<RepositoriesSchema>,
        private readonly paginatorService: PaginatorService,
    ) {
        super(repositoriesRepository);
    }

    create(createRepositoriesDto: Partial<CreateRepositoriesDto>) {
        const newRepository = this.repositoriesRepository.create({...createRepositoriesDto});
        return this.repositoriesRepository.save(newRepository);
    }

    public findAll(query: PaginatorQuery): Promise<PaginatedQuery<Repositories>> {
        const queryBuilder = this.repositoriesRepository
            .createQueryBuilder('repositories')
            .select([
                'repositories.id AS id',
                'repositories.creation_date AS creation_date',
                'repositories.update_date AS update_date',
                'repositories.name AS name',
                'repositories.type AS type',
                'repositories.base_url AS base_url',
                'repositories.api_path AS api_path',
                'repositories.identifier_type AS identifier_type',
                'repositories.prefix AS prefix',
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'repositories.id',
            'repositories.creation_date',
            'repositories.update_date',
            'repositories.name',
            'repositories.type',
            'repositories.base_url',
            'repositories.api_path',
            'repositories.identifier_type',
            'repositories.prefix',
        ], 'repositories.id');
    }

    update(id: number, updateRepositoriesDto: UpdateRepositoriesDto) {
        return this.repositoriesRepository.update({id}, {...updateRepositoriesDto});
    }

    remove(id: number) {
        return this.repositoriesRepository.delete({id});
    }

    findAllSchema(findManyOptions: FindManyOptions): Promise<RepositoriesSchema[]> {
        return this.RepositoriesSchemaRepository.find(findManyOptions);
    }

    findSchema(findOneOptions: FindOneOptions): Promise<RepositoriesSchema> {
        return this.RepositoriesSchemaRepository.findOne(findOneOptions);
    }

    async updateSchema(repositoryId: number, createRepositorySchemaDtos: CreateRepositorySchemaDto[]) {
        const repository = await this.repositoriesRepository.findOne({
            where: {id: repositoryId},
            relations: ['schemas']
        });
        const existingIds = repository.schemas.map(schema => schema.id);
        const promises: any = createRepositorySchemaDtos.map(async (createRepositorySchemaDto) => {
            const id = existingIds.splice(0, 1);
            if (id?.[0]) {
                return this.RepositoriesSchemaRepository.update({id: id[0]}, {...createRepositorySchemaDto});
            } else {
                createRepositorySchemaDto.repository = repository;
                const newRepositorySchema = this.RepositoriesSchemaRepository.create({...createRepositorySchemaDto});
                return this.RepositoriesSchemaRepository.save(newRepositorySchema);
            }
        });
        promises.push(this.deleteRemovedSchema(existingIds, repositoryId));
        await Promise.all(promises);
    }

    async deleteRemovedSchema(existingIds: number[], repositoryId: number) {
        const removedSchema = await this.findAllSchema({
            where: {
                repository: {id: repositoryId},
                id: In(existingIds),
            }
        });
        return this.RepositoriesSchemaRepository.remove(removedSchema);
    }
}
