import {Controller, Get, UseGuards} from '@nestjs/common';
import {TrainingCycle} from 'src/entities/training-cycle.entity';
import {PredictionsService} from 'src/predictions/predictions.service';
import {TrainingDataService} from 'src/training-data/training-data.service';
import {DataSource} from 'typeorm';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin, Role.User])
@Controller('dashboard')
export class DashboardController {
  constructor(private dataSource: DataSource,private trainingDataService :TrainingDataService,private predictionsService :PredictionsService) {}
  @Get('avg_confidant')
  avg_confidant() {
    return  this.dataSource
    .createQueryBuilder()
    .from('prediction', 'prediction')
    .leftJoin(TrainingCycle,'cycle','cycle.id =  prediction.training_cycle_id')
    .addSelect(`AVG(prediction.confidant)`, 'avg_confidant')
    .addSelect('cycle.id','cycle_id')
    .addSelect('cycle.text','cycle_name')
    .addGroupBy('cycle.id')
    .execute();

    
  }

  @Get('counters')
 async counters() {
    return {
    trainningData: await this.trainingDataService.trainingDataRepository.count(),
    predictions: await this.predictionsService.predictionsRepository.count()
   }
  }

}
