import {Injectable} from '@nestjs/common';
import {Expose, Transform, Type, plainToInstance} from 'class-transformer';
import {CommoditiesService} from 'src/commodities/commodities.service';
import {OrganizationsService} from 'src/organizations/organizations.service';
import {PredictionsService} from 'src/predictions/predictions.service';
import {TrainingCycleService} from 'src/training-cycle/training-cycle.service';
import {TrainingDataService} from 'src/training-data/training-data.service';

export class PredictionsForEachCycle {
    @Expose()
    cycle_id: number;

    @Expose()
    predictions_count: number;
}

export class PredictionsAverageForEachCycle {
    @Expose()
    cycle_id: number;

    @Expose()
    @Transform(({value}) => {
        return !!value ? value : 0;
    })
    predictions_average: number = 0;
}

export class Statistics {
    @Expose()
    totalCommodities: number;

    @Expose()
    totalOrganization: number;

    @Expose()
    totalTrainingCycle: number;

    @Expose()
    totalTrainingData: number;

    @Expose()
    totalPrediction: number;

    @Expose()
    @Type(() => PredictionsForEachCycle)
    predictionCountPerCycle: PredictionsForEachCycle[];

    @Expose()
    @Type(() => PredictionsAverageForEachCycle)
    averagePredictionPerCycle: PredictionsAverageForEachCycle[];
}

@Injectable()
export class StatisticsService {
    constructor(
        private organizationsService: OrganizationsService,
        private predictionsService: PredictionsService,
        private trainingCycleService: TrainingCycleService,
        private trainingDataService: TrainingDataService,
        private commoditiesService: CommoditiesService,
    ) {
    }

    async findAll(): Promise<Statistics> {
        const statistics = new Statistics();
        statistics.totalCommodities = await this.findTotalCommodities();
        statistics.totalOrganization = await this.findTotalOrganization();
        statistics.totalTrainingCycle = await this.findTotalTrainingCycle();
        statistics.totalTrainingData = await this.findTotalTrainingData();
        statistics.totalPrediction = await this.findTotalPrediction();
        statistics.predictionCountPerCycle = await this.findTrainingCycleData();
        statistics.averagePredictionPerCycle =
            await this.findTrainingCyclePredictionsAverage();
        return statistics;
    }

    findTotalCommodities() {
        return this.commoditiesService.count();
    }

    findTotalOrganization() {
        return this.organizationsService.organizationRepository.count();
    }

    findTotalTrainingCycle() {
        return this.trainingCycleService.trainingCycleRepository.count();
    }

    findTotalTrainingData() {
        return this.trainingDataService.count();
    }

    findTotalPrediction() {
        return this.predictionsService.predictionsRepository.count();
    }

    async findTrainingCycleData() {
        const q: PredictionsForEachCycle[] =
            await this.trainingCycleService.trainingCycleRepository
                .createQueryBuilder('cycle')
                .select('cycle.id', 'cycle_id')
                .addSelect('cycle.text', 'cycle')
                .addSelect('COUNT(prediction.id) as predictions_count')
                .leftJoin('cycle.predictions', 'prediction')
                .groupBy('cycle.id')
                .orderBy('cycle_id', 'ASC')
                .execute();

        return plainToInstance(PredictionsForEachCycle, q, {
            enableImplicitConversion: true,
            enableCircularCheck: true,
        });
    }

    async findTrainingCyclePredictionsAverage() {
        const q: PredictionsAverageForEachCycle[] =
            await this.trainingCycleService.trainingCycleRepository
                .createQueryBuilder('cycle')
                .select('cycle.id', 'cycle_id')
                .addSelect('cycle.text', 'cycle')
                .addSelect('AVG(prediction.confidant) as predictions_average')
                .leftJoin('cycle.predictions', 'prediction')
                .groupBy('cycle.id')
                .orderBy('cycle_id', 'ASC')
                .execute();

        return plainToInstance(PredictionsAverageForEachCycle, q, {
            enableImplicitConversion: true,
            enableCircularCheck: true,
            exposeDefaultValues: true,
        });
    }
}
