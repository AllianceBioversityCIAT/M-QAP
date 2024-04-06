import {Module} from '@nestjs/common';
import {SubstitutionDataController} from './substitution-data.controller';
import {SubstitutionDataService} from './substitution-data.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SubstitutionData} from '../entities/substitution-data.entity';
import {PaginatorService} from '../paginator/paginator.service';

@Module({
    imports: [TypeOrmModule.forFeature([SubstitutionData])],
    controllers: [SubstitutionDataController],
    providers: [SubstitutionDataService, PaginatorService],
    exports: [SubstitutionDataService],
})
export class SubstitutionDataModule {
}
