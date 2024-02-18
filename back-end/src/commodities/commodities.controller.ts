import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post, UseGuards,
} from '@nestjs/common';

import {CommoditiesService} from './commodities.service';
import {Paginate, PaginateQuery} from 'nestjs-paginate';
import {CreateCommoditiesDto} from './dto/create-commodities.dto';
import {UpdateCommoditiesDto} from './dto/update-commodities.dto';
import {RolesGuard} from '../auth/roles.guard';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('commodities')
export class CommoditiesController {
    constructor(private commoditiesService: CommoditiesService) {
    }

    @Post()
    create(@Body() createUserDto: CreateCommoditiesDto) {
        return this.commoditiesService.create(createUserDto);
    }

    @Get('process-sheet/:fileName')
    processSheet(@Param('fileName') fileName: string) {
        return this.commoditiesService.processSheet(fileName);
    }

    @Get('')
    findAll(@Paginate() query: PaginateQuery) {
        return this.commoditiesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.commoditiesService.findOne({where: {id}, relations: ['parent']});
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateCommoditiesDto) {
        return this.commoditiesService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.commoditiesService.remove(+id);
    }
}
