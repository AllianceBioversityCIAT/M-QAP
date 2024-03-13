import {Module} from '@nestjs/common';
import {TrainingDataController} from './training-data.controller';
import {TrainingDataService} from './training-data.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TrainingData} from 'src/entities/training-data.entity';
import {PaginatorService} from '../paginator/paginator.service';

@Module({
    imports: [TypeOrmModule.forFeature([TrainingData])],
    controllers: [TrainingDataController],
    providers: [TrainingDataService, PaginatorService],
    exports: [TrainingDataService]
})
export class TrainingDataModule {
}
