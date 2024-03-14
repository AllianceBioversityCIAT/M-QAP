import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {TrainingData} from 'src/entities/training-data.entity';
import {Repository} from 'typeorm';
import {resolve} from 'path';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {CreateTrainingDataDto} from './dto/create-training-data.dto';
import {UpdateTrainingDataDto} from './dto/update-training-data.dto';

const excelToJson = require('convert-excel-to-json');

@Injectable()
export class TrainingDataService extends TypeOrmCrudService<TrainingData> {
    constructor(
        @InjectRepository(TrainingData)
        public trainingDataRepository: Repository<TrainingData>,
        private readonly paginatorService: PaginatorService,
    ) {
        super(trainingDataRepository);
    }

    async create(createTrainingDataDto: CreateTrainingDataDto) {
        try {
            const record = this.trainingDataRepository.create({
                ...createTrainingDataDto,
            });
            return await this.trainingDataRepository.save(record);
        } catch (error) {
            (error) => console.log('>>>>', error);
            throw new BadRequestException('Duplicated data');
        }
    }

    public findAll(query: PaginatorQuery): Promise<PaginatedQuery<TrainingData>> {
        const queryBuilder = this.trainingDataRepository
            .createQueryBuilder('training_data')
            .select([
                'training_data.id AS id',
                'training_data.creation_date AS creation_date',
                'training_data.update_date AS update_date',
                'training_data.text AS text',
                'training_data.clarisa_id AS clarisa_id',
                'training_data.source AS source',
                'organization.name AS organization_name',
                'organization.acronym AS organization_acronym',
            ])
            .leftJoin('organization', 'organization', 'organization.id = training_data.clarisa_id');

        return this.paginatorService.paginator(query, queryBuilder, [
            'training_data.id',
            'training_data.creation_date',
            'training_data.update_date',
            'training_data.text',
            'training_data.source',
            'organization.name',
            'organization.acronym',
        ], 'training_data.id');
    }

    getAll(where = {}) {
        return this.trainingDataRepository.find({where, relations: ['clarisa']});
    }

    async processSheet(fileName: string) {
        const filePath = resolve(process.cwd(), 'media', fileName);

        const result: Array<{ A: string; B: number }> =
            excelToJson({
                sourceFile: filePath,
            })?.Foglio1 ?? [];
        result.shift(); //remove columns readers.

        for await (const item of result) {
            const record = this.trainingDataRepository.create({
                clarisa_id: item.B,
                text: item.A,
                source: 'system/excel',
            });
            await this.trainingDataRepository.save(record).catch((e) => {
                console.error('>>>>>>>>>>>>>>>>>>>>>> error');
            });
        }

        return result;
    }

    update(id: number, updateUserDto: UpdateTrainingDataDto) {
        return this.trainingDataRepository.update({id}, {...updateUserDto});
    }

    remove(id: number) {
        return this.trainingDataRepository.delete({id});
    }
}
