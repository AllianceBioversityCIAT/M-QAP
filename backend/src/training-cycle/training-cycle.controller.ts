import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TrainingCycleService } from './training-cycle.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdateTrainingCycleDto } from './dto/update-training-cycle.dto';
@Controller('training-cycle')
export class TrainingCycleController {
  constructor(private trainingCycleService: TrainingCycleService) {}

  @Post(':id')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
  ) {
    const training_folder_path = path.join(
      process.cwd(),
      'uploads/training-data/' + id,
    );
    fs.mkdirSync(training_folder_path, {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(training_folder_path, '/' + file.originalname),
      file.buffer,
    );

    return file;
  }

  @Get('')
  findAll(@Paginate() query: PaginateQuery) {
    return this.trainingCycleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.trainingCycleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateTrainingCycleDto,
  ) {
    return this.trainingCycleService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.trainingCycleService.remove(+id);
  }
}
