import {Module} from '@nestjs/common';
import {CommoditiesController} from './commodities.controller';
import {CommoditiesService} from './commodities.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Commodity} from 'src/entities/commodities.entity';
import {PaginatorService} from '../paginator/paginator.service';

@Module({
    imports: [TypeOrmModule.forFeature([Commodity])],
    controllers: [CommoditiesController],
    providers: [CommoditiesService, PaginatorService],
    exports: [CommoditiesService]
})
export class CommoditiesModule {
}
