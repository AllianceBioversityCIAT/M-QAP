import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { TrainingCycle as TrainingCycle } from 'src/entities/training-cycle.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateTrainingCycleDto } from './dto/create-training-cycle.dto';
import { UpdateTrainingCycleDto } from './dto/update-training-cycle.dto';

@Injectable()
export class TrainingCycleService {
  constructor(
    @InjectRepository(TrainingCycle)
    public trainingCycleRepository: Repository<TrainingCycle>,
  ) {}

  create(createTrainingCycleDto: CreateTrainingCycleDto) {
    const record = this.trainingCycleRepository.create({ ...createTrainingCycleDto });
    return this.trainingCycleRepository.save(record);
  }

  public findAll(query: PaginateQuery): Promise<Paginated<TrainingCycle>> {
    return paginate(query, this.trainingCycleRepository, {
      sortableColumns: ['id', 'text', 'creation_date'],
      searchableColumns: ['text', 'creation_date'],
      relations: [],
      select: [],
      filterableColumns: {},
    });
  }

  findOne(id: number) {
    return this.trainingCycleRepository.findOne({ where: { id } });
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
      order: { id: 'DESC' },
    });
  }

  update(id: number, updateTrainingCycleDto: UpdateTrainingCycleDto) {
    return this.trainingCycleRepository.update({ id }, { ...updateTrainingCycleDto });
  }

  remove(id: number) {
    return this.trainingCycleRepository.delete({ id });
  }
}
