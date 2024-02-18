import {Controller, Get, Param, Query, UseGuards} from '@nestjs/common';
import {OrganizationsService} from './organizations.service';
import {ApiTags} from '@nestjs/swagger';
import {OrganizationQueryParamsDTO} from './dto/search-organization-query.dto';
import {Paginate, PaginateQuery} from 'nestjs-paginate';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {
    }

    @Get('')
    findAll(@Paginate() query: PaginateQuery) {
        return this.organizationsService.findAll(query);
    }

    @Get('/search')
    search(@Query() query: OrganizationQueryParamsDTO) {
        return this.organizationsService.searchOrganization(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(+id);
    }

    @Get('import/partners')
    async importPartners() {
        await this.organizationsService.importPartners();
        return 'Partners imported successfully';
    }
}
