import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post, Query, UseGuards,
} from '@nestjs/common';

import {CommoditiesService} from './commodities.service';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';
import {CreateCommoditiesDto} from './dto/create-commodities.dto';
import {UpdateCommoditiesDto} from './dto/update-commodities.dto';
import {RolesGuard} from '../auth/roles.guard';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {ApiTags} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin, Role.User])
@ApiTags('Commodities')
@Controller('commodities')
export class CommoditiesController {
    constructor(private commoditiesService: CommoditiesService) {
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Post()
    create(@Body() createUserDto: CreateCommoditiesDto) {
        return this.commoditiesService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Get('process-sheet/:fileName')
    processSheet(@Param('fileName') fileName: string) {
        return this.commoditiesService.processSheet(fileName);
    }

    @Get('')
    findAll(
        @Query('parent') parent: boolean,
        @Paginator() query: PaginatorQuery,
    ) {
        query.sortBy = query?.sortBy ? query.sortBy : [['name', 'ASC']];
        return this.commoditiesService.findAll(query, parent);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.commoditiesService.findOne({where: {id}, relations: ['parent']});
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateCommoditiesDto) {
        return this.commoditiesService.update(+id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.commoditiesService.remove(+id);
    }
}
