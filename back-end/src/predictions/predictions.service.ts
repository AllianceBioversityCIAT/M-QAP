import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {Prediction} from 'src/entities/predictions.entity';
import {TrainingCycleService} from 'src/training-cycle/training-cycle.service';
import {Repository} from 'typeorm';

@Injectable()
export class PredictionsService {
    constructor(
        @InjectRepository(Prediction)
        public predictionsRepository: Repository<Prediction>,
        private trainingCycleService: TrainingCycleService,
        private readonly paginatorService: PaginatorService,
    ) {
    }

    async create(createUserDto: any) {
        const cycle = await this.trainingCycleService.findLatestOne(true);
        const exist = await this.predictionsRepository.findOne({
            where: {text: createUserDto.text, trainingCycle: cycle},
        });
        if (!exist) {
            createUserDto['trainingCycle'] = cycle;
            const newUser = this.predictionsRepository.create({
                ...createUserDto,
            });
            return this.predictionsRepository.save(newUser);
        }
    }

    findAll(query: PaginatorQuery): Promise<PaginatedQuery<Prediction>> {
        const queryBuilder = this.predictionsRepository
            .createQueryBuilder('prediction')
            .select([
                'prediction.id AS id',
                'prediction.creation_date AS creation_date',
                'prediction.update_date AS update_date',
                'prediction.text AS text',
                'prediction.clarisa_id AS clarisa_id',
                'prediction.confidant AS confidant',
                'prediction.training_cycle_id AS training_cycle_id',
                'organization.name AS organization_name',
                'organization.acronym AS organization_acronym',
                'training_cycle.text AS training_cycle_name',
            ])
            .innerJoin('organization', 'organization', 'organization.id = prediction.clarisa_id')
            .innerJoin('training_cycle', 'training_cycle', 'training_cycle.id = prediction.training_cycle_id');

        return this.paginatorService.paginator(query, queryBuilder, [
            'prediction.id',
            'prediction.creation_date',
            'prediction.update_date',
            'prediction.text',
            'prediction.confidant',
            'organization.name',
            'organization.acronym',
            'training_cycle.text',
        ], 'prediction.id');
    }

    findOne(id: number) {
        return this.predictionsRepository.findOne({where: {id}, relations: ['clarisa']});
    }

    update(id: number, updateUserDto: any) {
        return this.predictionsRepository.update({id}, {...updateUserDto});
    }

    remove(id: number) {
        return this.predictionsRepository.delete({id});
    }
}
