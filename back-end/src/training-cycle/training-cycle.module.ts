import {Module} from '@nestjs/common';
import {TrainingCycleService} from './training-cycle.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TrainingCycle} from 'src/entities/training-cycle.entity';
import {TrainingData} from 'src/entities/training-data.entity';
import {TrainingCycleController} from './training-cycle.controller';
import {HttpModule} from '@nestjs/axios';
import {AiTrainingModule} from '../ai/ai-training.module';
import {TrainingDataService} from '../training-data/training-data.service';
import {SocketsGateway} from '../sockets/sockets.gateway';
import {PaginatorService} from '../paginator/paginator.service';

@Module({
    imports: [TypeOrmModule.forFeature([TrainingCycle, TrainingData]), HttpModule, AiTrainingModule],
    controllers: [TrainingCycleController],
    providers: [TrainingCycleService, TrainingDataService, SocketsGateway, PaginatorService],
    exports: [TrainingCycleService]
})
export class TrainingCycleModule {
}
