import {Module} from '@nestjs/common';
import {TrainingCycleService} from '../training-cycle/training-cycle.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TrainingCycle} from 'src/entities/training-cycle.entity';
import {TrainingData} from 'src/entities/training-data.entity';
import {HttpModule} from '@nestjs/axios';
import {AiTrainingService} from './ai-training.service';
import {TrainingDataService} from '../training-data/training-data.service';
import {SocketsGateway} from '../sockets/sockets.gateway';
import {PaginatorService} from '../paginator/paginator.service';
import {OrganizationsService} from '../organizations/organizations.service';
import {Organization} from '../entities/organization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TrainingCycle, TrainingData, Organization]), HttpModule],
    providers: [TrainingCycleService, AiTrainingService, TrainingDataService, SocketsGateway, PaginatorService, OrganizationsService],
    exports: [AiTrainingService]
})
export class AiTrainingModule {
}
