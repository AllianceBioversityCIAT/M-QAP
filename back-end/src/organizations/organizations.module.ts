import {Module} from '@nestjs/common';
import {OrganizationsService} from './organizations.service';
import {OrganizationsController} from './organizations.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Organization} from 'src/entities/organization.entity';
import {HttpModule} from '@nestjs/axios';
import {PaginatorService} from '../paginator/paginator.service';

@Module({
    imports: [TypeOrmModule.forFeature([Organization]), HttpModule],
    controllers: [OrganizationsController],
    providers: [OrganizationsService, PaginatorService],
    exports: [OrganizationsService],
})
export class OrganizationsModule {
}
