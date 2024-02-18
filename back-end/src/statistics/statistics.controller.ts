import {Controller, Get, UseGuards} from '@nestjs/common';
import {StatisticsService} from './statistics.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.User)

@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {
    }

    @Get()
    findAll() {
        return this.statisticsService.findAll();
    }
}
