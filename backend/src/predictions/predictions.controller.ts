import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@Controller('predictions')
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Post()
  create(@Body() createUserDto: any) {
    return this.predictionsService.create(createUserDto);
  }

  @Get('')
  findAll(@Paginate() query: PaginateQuery) {
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
