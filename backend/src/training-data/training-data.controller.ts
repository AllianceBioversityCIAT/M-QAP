import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TrainingDataService } from './training-data.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdateTrainingDataDto } from './dto/update-training-data.dto';
import { CreateTrainingDataDto } from './dto/create-training-data.dto';

@Controller('training-data')
export class TrainingDataController {
  constructor(private trainingDataService: TrainingDataService) {}

  @Post()
  create(@Body() createTrainingDataDto: CreateTrainingDataDto) {
    return this.trainingDataService.create(createTrainingDataDto);
  }

  @Get('process-sheet/:fileName')
  processSheet(@Param('fileName') fileName: string) {
    return this.trainingDataService.processSheet(fileName);
  }

  @Get('')
  findAll(@Paginate() query: PaginateQuery) {
    return this.trainingDataService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.trainingDataService.findOne({ where: { id } , relations: ['clarisa']});
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
