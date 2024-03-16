import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {OrganizationsService} from './organizations.service';
import {ApiTags} from '@nestjs/swagger';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin, Role.User])
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        query.sortBy = query?.sortBy ? query.sortBy : [['name', 'ASC']];
        return this.organizationsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Get('import/partners')
    async importPartners() {
        await this.organizationsService.importPartners();
        return 'Partners imported successfully';
    }
}
