import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {ApiKeysService} from './api-keys.service';
import {Paginate, PaginateQuery} from 'nestjs-paginate';
import {CreateApiKeyDto} from './dto/create-api-key.dto';
import {UpdateApiKeyDto} from './dto/update-api-key.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('api-keys')
export class ApiKeysController {
    constructor(
        private apiKeysService: ApiKeysService
    ) {
    }

    @Get('usage/:year')
    usage(@Param('year') year: number) {
        return this.apiKeysService.getApiKeysUsage(+year);
    }

    @Get('summary/:year')
    async findAllSummary(
        @Paginate() query: PaginateQuery,
        @Param('year') year: number,
        ) {
        return await this.apiKeysService.findAllSummary(query, year);
    }

    @Get('details/:apiKeyId/:type/:year')
    async findAllDetails(
        @Paginate() query: PaginateQuery,
        @Param('apiKeyId') apiKeyId: number,
        @Param('type') type: string,
        @Param('year') year: number,
        ) {
        return await this.apiKeysService.findAllDetails(query, apiKeyId, type, year);
    }

    @Post()
    create(@Body() createApiKeyDto: CreateApiKeyDto) {
        return this.apiKeysService.create(createApiKeyDto);
    }

    @Get('')
    findAll(@Paginate() query: PaginateQuery) {
        return this.apiKeysService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.apiKeysService.findOne({where: {id}, relations: ['organization', 'user']});
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
        return this.apiKeysService.update(+id, updateApiKeyDto);
    }

    @Patch('update-status/:id')
    updateStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return this.apiKeysService.updateStatus(+id, is_active);
    }

    @Patch('regenerate/:id')
    regenerate(@Param('id') id: string) {
        return this.apiKeysService.regenerate(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.apiKeysService.remove(+id);
    }
}
