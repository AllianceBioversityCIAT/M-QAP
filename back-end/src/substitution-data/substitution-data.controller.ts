import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {ApiTags} from '@nestjs/swagger';
import {SubstitutionDataService} from './substitution-data.service';
import {Paginator} from '../paginator/paginator.decorator';
import {PaginatorQuery} from '../paginator/types';
import {CreateSubstitutionDataDto} from './dto/create-substitution-data.dto';
import {UpdateSubstitutionDataDto} from './dto/update-substitution-data.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin])
@ApiTags('Substitution data')
@Controller('substitution-data')
export class SubstitutionDataController {
    constructor(private substitutionDataService: SubstitutionDataService) {
    }

    @Post()
    create(@Body() createSubstitutionDataDto: CreateSubstitutionDataDto) {
        return this.substitutionDataService.create(createSubstitutionDataDto);
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        return this.substitutionDataService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.substitutionDataService.findOne({where: {id}});
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() updateSubstitutionDataDto: UpdateSubstitutionDataDto,
    ) {
        return this.substitutionDataService.update(id, updateSubstitutionDataDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.substitutionDataService.remove(+id);
    }
}
