import {Injectable} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {Repositories} from 'src/entities/repositories.entity';
import {RepositoriesSchema} from 'src/entities/repositories-schema.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {FindOneOptions, In, Not, Repository} from 'typeorm';
import {paginate, Paginated, PaginateQuery} from 'nestjs-paginate';
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
    ) {
        super(repositoriesRepository);
    }

    create(createRepositoriesDto: Partial<CreateRepositoriesDto>) {
        const newRepository = this.repositoriesRepository.create({...createRepositoriesDto});
        return this.repositoriesRepository.save(newRepository);
    }

    public findAll(query: PaginateQuery): Promise<Paginated<Repositories>> {
        return paginate(query, this.repositoriesRepository, {
            sortableColumns: ['id', 'name'],
            searchableColumns: ['name'],
            select: [],
        });
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
        const repository = await this.repositoriesRepository.findOne({where: {id: repositoryId}});
        console.log(repositoryId, repository)
        const sources = [];
        const promises: any = createRepositorySchemaDtos.map(async (createRepositorySchemaDto) => {
            sources.push(createRepositorySchemaDto.source);
            createRepositorySchemaDto.repository = repository;
            const schema = await this.findSchema({
                where: {
                    repository: {id: repositoryId},
                    source: createRepositorySchemaDto.source
                }
            });
            if (schema) {
                if (schema.target !== createRepositorySchemaDto.target) {
                    const updateRepositorySchemaDto = {
                        target: createRepositorySchemaDto.target,
                    } as UpdateRepositorySchemaDto;
                    return this.RepositoriesSchemaRepository.update({id: schema.id}, {...updateRepositorySchemaDto});
                } else {
                    return schema;
                }
            } else {
                const newRepositorySchema = this.RepositoriesSchemaRepository.create({...createRepositorySchemaDto});
                return this.RepositoriesSchemaRepository.save(newRepositorySchema);
            }
        });
        promises.push(this.deleteRemovedSchema(sources, repositoryId));
        await Promise.all(promises);
    }

    async deleteRemovedSchema(sources: string[], repositoryId: number) {
        const removedSchema = await this.findAllSchema({
            where: {
                repository: {id: repositoryId},
                source: Not(In(sources))
            }
        });
        return this.RepositoriesSchemaRepository.remove(removedSchema);
    }
}
