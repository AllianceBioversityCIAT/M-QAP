import {BadRequestException, Injectable} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {SubstitutionData} from '../entities/substitution-data.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PaginatorService} from '../paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from '../paginator/types';
import {CreateSubstitutionDataDto} from './dto/create-substitution-data.dto';
import {UpdateSubstitutionDataDto} from './dto/update-substitution-data.dto';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class SubstitutionDataService extends TypeOrmCrudService<SubstitutionData> {
    constructor(
        @InjectRepository(SubstitutionData)
        public substitutionDataRepository: Repository<SubstitutionData>,
        private readonly paginatorService: PaginatorService,
    ) {
        super(substitutionDataRepository);
    }

    async create(createSubstitutionDataDto: CreateSubstitutionDataDto) {
        try {
            const record = this.substitutionDataRepository.create({
                ...createSubstitutionDataDto,
            });
            return await this.substitutionDataRepository.save(record);
        } catch (error) {
            throw new BadRequestException('Duplicated data');
        }
    }

    public findAll(query: PaginatorQuery): Promise<PaginatedQuery<SubstitutionData>> {
        const queryBuilder = this.substitutionDataRepository
            .createQueryBuilder('substitution_data')
            .select([
                'substitution_data.id AS id',
                'substitution_data.creation_date AS creation_date',
                'substitution_data.update_date AS update_date',
                'substitution_data.find_text AS find_text',
                'substitution_data.replace_text AS replace_text',
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'substitution_data.id',
            'substitution_data.creation_date',
            'substitution_data.update_date',
            'substitution_data.find_text',
            'substitution_data.replace_text',
        ], 'substitution_data.id');
    }

    getAll(where: FindOptionsWhere<SubstitutionData> = {}) {
        return this.substitutionDataRepository.find({where});
    }

    update(id: number, updateSubstitutionDataDto: UpdateSubstitutionDataDto) {
        return this.substitutionDataRepository.update({id}, {...updateSubstitutionDataDto});
    }

    remove(id: number) {
        return this.substitutionDataRepository.delete({id});
    }
}
