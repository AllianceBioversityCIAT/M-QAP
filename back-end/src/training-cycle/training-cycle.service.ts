import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {TrainingCycle as TrainingCycle} from 'src/entities/training-cycle.entity';
import {IsNull, Not, Repository} from 'typeorm';
import {CreateTrainingCycleDto} from './dto/create-training-cycle.dto';
import {UpdateTrainingCycleDto} from './dto/update-training-cycle.dto';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class TrainingCycleService {
    constructor(
        @InjectRepository(TrainingCycle)
        public trainingCycleRepository: Repository<TrainingCycle>,
        private readonly paginatorService: PaginatorService,
    ) {
    }

    create(createTrainingCycleDto: CreateTrainingCycleDto) {
        const record = this.trainingCycleRepository.create({...createTrainingCycleDto});
        return this.trainingCycleRepository.save(record);
    }

    public findAll(query: PaginatorQuery): Promise<PaginatedQuery<TrainingCycle>> {
        const queryBuilder = this.trainingCycleRepository
            .createQueryBuilder('training_cycle')
            .select([
                'training_cycle.id AS id',
                'training_cycle.creation_date AS creation_date',
                'training_cycle.update_date AS update_date',
                'training_cycle.text AS text',
                'training_cycle.training_is_completed AS training_is_completed',
                'training_cycle.is_active AS is_active',
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'training_cycle.id',
            'training_cycle.creation_date',
            'training_cycle.update_date',
            'training_cycle.text',
            'IF(training_cycle.training_is_completed = 1, "Yes", "No")',
            'IF(training_cycle.is_active = 1, "Yes", "No")',
        ], 'training_cycle.id');
    }

    findOne(id: number) {
        return this.trainingCycleRepository.findOne({where: {id}});
    }

    findLatestOne(completeStatus = null) {
        const where = {
            id: Not(IsNull()),
            training_is_completed: true,
        };

        if (completeStatus === true) {
            where.training_is_completed = true;
        } else if (completeStatus === false) {
            where.training_is_completed = false;
        } else {
            delete where.training_is_completed;
        }

        return this.trainingCycleRepository.findOne({
            where,
            order: {id: 'DESC'},
        });
    }

    findLatestActiveOne() {
        return this.trainingCycleRepository.findOne({
            where: {
                training_is_completed: true,
                is_active: true,
            },
            order: {id: 'DESC'},
        });
    }

    update(criteria: FindOptionsWhere<TrainingCycle>, updateTrainingCycleDto: UpdateTrainingCycleDto) {
        return this.trainingCycleRepository.update(criteria, {...updateTrainingCycleDto});
    }

    async remove(id: number) {
        try {
            return await this.trainingCycleRepository.delete({id});
        } catch (error) {
            if (error.errno === 1451) {
                throw new BadRequestException('Cannot delete, this training cycle has related predictions.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }
}
