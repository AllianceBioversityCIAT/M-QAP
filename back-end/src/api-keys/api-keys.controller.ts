import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {ApiKeysService} from './api-keys.service';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';
import {CreateApiKeyDto} from './dto/create-api-key.dto';
import {UpdateApiKeyDto} from './dto/update-api-key.dto';
import {CreateWosQuotaDto} from './dto/create-wos-quota.dto';
import {UpdateWosQuotaDto} from './dto/update-wos-quota.dto';
import {CreateWosQuotaYearDto} from './dto/create-wos-quota-year.dto';
import {UpdateWosQuotaYearDto} from './dto/update-wos-quota-year.dto';

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
        @Paginator() query: PaginatorQuery,
        @Param('year') year: number,
        ) {
        return await this.apiKeysService.findAllSummary(query, year);
    }

    @Get('details/:apiKeyId/:type/:year')
    async findAllDetails(
        @Paginator() query: PaginatorQuery,
        @Param('apiKeyId') apiKeyId: number,
        @Param('type') type: string,
        @Param('year') year: number,
        ) {
        return await this.apiKeysService.findAllDetails(query, apiKeyId, type, year);
    }

    @Post('wos-quota')
    createWosQuota(
        @Body() createWosQuotaDto: CreateWosQuotaDto,
        ) {
        return this.apiKeysService.createWosQuota(createWosQuotaDto);
    }

    @Patch('wos-quota/:id')
    updateWosQuota(
        @Param('id') id: string,
        @Body() updateWosQuotaDto: UpdateWosQuotaDto,
    ) {
        return this.apiKeysService.updateWosQuota(+id, updateWosQuotaDto);
    }

    @Get('wos-quota')
    findAllWosQuota(@Paginator() query: PaginatorQuery) {
        return this.apiKeysService.findAllWosQuota(query);
    }

    @Get('wos-quota/:id')
    findOneWosQuota(
        @Param('id') id: number,
    ) {
        return this.apiKeysService.findOneWosQuota({where: {id}, relations: ['organization']});
    }

    @Patch('wos-quota/update-status/:id')
    updateStatusWosQuota(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return this.apiKeysService.updateStatusWosQuota(+id, is_active);
    }

    @Delete('wos-quota/:id')
    removeWosQuota(@Param('id') id: string) {
        return this.apiKeysService.removeWosQuota(+id);
    }

    @Post('wos-quota-year/:wosQuotaId')
    createWosQuotaYear(
        @Param('wosQuotaId') wosQuotaId: number,
        @Body() createWosQuotaYearDto: CreateWosQuotaYearDto,
        ) {
        return this.apiKeysService.createWosQuotaYear(wosQuotaId, createWosQuotaYearDto);
    }

    @Patch('wos-quota-year/:id')
    updateWosQuotaYear(
        @Param('id') id: string,
        @Body() updateWosQuotaYearDto: UpdateWosQuotaYearDto,
    ) {
        return this.apiKeysService.updateWosQuotaYear(+id, updateWosQuotaYearDto);
    }

    @Get('wos-quota-year')
    findAllWosQuotaYear(
        @Query('wosQuotaId') wosQuotaId: number,
        @Paginator() query: PaginatorQuery,
        ) {
        return this.apiKeysService.findAllWosQuotaYear(wosQuotaId, query);
    }

    @Get('wos-quota-year/:id')
    findOneWosQuotaYear(
        @Param('id') id: number,
    ) {
        return this.apiKeysService.findOneWosQuotaYear({where: {id}});
    }

    @Delete('wos-quota-year/:id')
    removeWosQuotaYear(@Param('id') id: string) {
        return this.apiKeysService.removeWosQuotaYear(+id);
    }

    @Post('api-keys/:wosQuotaId')
    create(
        @Param('wosQuotaId') wosQuotaId: number,
        @Body() createApiKeyDto: CreateApiKeyDto,
    ) {
        return this.apiKeysService.create(wosQuotaId, createApiKeyDto);
    }

    @Get('api-keys/:wosQuotaId')
    findAll(
        @Param('wosQuotaId') wosQuotaId: number,
        @Paginator() query: PaginatorQuery,
    ) {
        return this.apiKeysService.findAll(query, wosQuotaId);
    }

    @Get('api-key/:id')
    findOne(@Param('id') id: number) {
        return this.apiKeysService.findOne({where: {id}, relations: ['organization', 'user']});
    }

    @Patch('api-keys/:id')
    update(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
        return this.apiKeysService.update(+id, updateApiKeyDto);
    }

    @Patch('api-keys/update-status/:id')
    updateStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return this.apiKeysService.updateStatus(+id, is_active);
    }

    @Patch('api-keys/regenerate/:id')
    regenerate(@Param('id') id: string) {
        return this.apiKeysService.regenerate(+id);
    }

    @Delete('api-keys/:id')
    remove(@Param('id') id: string) {
        return this.apiKeysService.remove(+id);
    }
}
