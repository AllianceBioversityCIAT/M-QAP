import {Body, Controller, Delete, Get, Param, Post, UseGuards} from '@nestjs/common';
import {PredictionsService} from './predictions.service';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)

@Controller('predictions')
export class PredictionsController {
    constructor(private predictionsService: PredictionsService) {
    }

    @Post()
    create(@Body() createUserDto: any) {
        return this.predictionsService.create(createUserDto);
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        return this.predictionsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.predictionsService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.predictionsService.remove(+id);
    }
}
