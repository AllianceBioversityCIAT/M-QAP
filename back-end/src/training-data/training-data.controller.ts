import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {TrainingDataService} from './training-data.service';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';
import {UpdateTrainingDataDto} from './dto/update-training-data.dto';
import {CreateTrainingDataDto} from './dto/create-training-data.dto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin])
@Controller('training-data')
export class TrainingDataController {
    constructor(private trainingDataService: TrainingDataService) {
    }

    @Post()
    create(@Body() createTrainingDataDto: CreateTrainingDataDto) {
        return this.trainingDataService.create(createTrainingDataDto);
    }

    @Get('process-sheet/:fileName')
    processSheet(@Param('fileName') fileName: string) {
        return this.trainingDataService.processSheet(fileName);
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        return this.trainingDataService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.trainingDataService.findOne({where: {id}, relations: ['clarisa']});
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() updateTrainingDataDto: UpdateTrainingDataDto,
    ) {
        return this.trainingDataService.update(id, updateTrainingDataDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.trainingDataService.remove(+id);
    }
}
