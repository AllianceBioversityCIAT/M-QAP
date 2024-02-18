import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import {TrainingCycleService} from './training-cycle.service';
import {FileInterceptor} from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import {Paginate, PaginateQuery} from 'nestjs-paginate';
import {UpdateTrainingCycleDto} from './dto/update-training-cycle.dto';
import {AiTrainingService} from '../ai/ai-training.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('training-cycle')
export class TrainingCycleController {
    constructor(
        private trainingCycleService: TrainingCycleService,
        private aiTrainingService: AiTrainingService,
    ) {
    }

    @Get('/start-training')
    async startTraining() {
        return await this.aiTrainingService.startCycleTraining();
    }

    @Get('/cancel-training')
    async cancelTraining() {
        return this.aiTrainingService.cancelCycleTraining();
    }

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
    async remove(@Param('id') id: number) {
        if (this.aiTrainingService.activeTrainingCycleId === id) {
            throw new HttpException(
                'Training for this cycle is in progress, please wait until the training is completed or cancel the training before deleting the cycle.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        try {
            const result = await this.trainingCycleService.remove(+id);
            if (this.aiTrainingService.activeCycleId === id) {
                this.aiTrainingService.init();
            }

            return result;
        } catch (e) {
            throw new HttpException(
                'This cycle is linked to predictions and cannot be deleted.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
