import {Controller, Get, UseGuards} from '@nestjs/common';
import {StatisticsService} from './statistics.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {ApiTags} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin, Role.User])

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {
    }

    @Get()
    findAll() {
        return this.statisticsService.findAll();
    }
}
