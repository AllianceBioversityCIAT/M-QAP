import {Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards} from '@nestjs/common';
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
@Roles([Role.Admin], ['quotaResponsible'])
@Controller('api-keys')
export class ApiKeysController {
    constructor(
        private apiKeysService: ApiKeysService
    ) {
    }

    @Get('usage/:year')
    usage(@Request() req, @Param('year') year: number) {
        return this.apiKeysService.getApiKeysUsage(req, +year);
    }

    @Get('quota-summary/:year')
    async findAllQuotaSummary(
        @Request() req,
        @Paginator() query: PaginatorQuery,
        @Param('year') year: number,
        ) {
        return await this.apiKeysService.findAllQuotaSummary(req, query, year);
    }

    @Get('details/:quotaId/:type/:year')
    async findAllDetails(
        @Request() req,
        @Paginator() query: PaginatorQuery,
        @Param('quotaId') quotaId: number,
        @Param('type') type: string,
        @Param('year') year: number,
        ) {
        return await this.apiKeysService.findAllDetails(req, query, quotaId, type, year);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Post('wos-quota')
    createWosQuota(
        @Body() createWosQuotaDto: CreateWosQuotaDto,
        ) {
        return this.apiKeysService.createWosQuota(createWosQuotaDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Patch('wos-quota/:id')
    updateWosQuota(
        @Param('id') id: string,
        @Body() updateWosQuotaDto: UpdateWosQuotaDto,
    ) {
        return this.apiKeysService.updateWosQuota(+id, updateWosQuotaDto);
    }

    @Get('wos-quota')
    findAllWosQuota(@Request() req, @Paginator() query: PaginatorQuery) {
        return this.apiKeysService.findAllWosQuota(req, query);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Get('wos-quota/:id')
    findOneWosQuota(
        @Param('id') id: number,
    ) {
        return this.apiKeysService.findOneWosQuota({where: {id}, relations: ['organization']});
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Patch('wos-quota/update-status/:id')
    updateStatusWosQuota(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return this.apiKeysService.updateStatusWosQuota(+id, is_active);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Delete('wos-quota/:id')
    removeWosQuota(@Param('id') id: string) {
        return this.apiKeysService.removeWosQuota(+id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Post('wos-quota-year/:wosQuotaId')
    createWosQuotaYear(
        @Param('wosQuotaId') wosQuotaId: number,
        @Body() createWosQuotaYearDto: CreateWosQuotaYearDto,
        ) {
        return this.apiKeysService.createWosQuotaYear(wosQuotaId, createWosQuotaYearDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Patch('wos-quota-year/:id')
    updateWosQuotaYear(
        @Param('id') id: string,
        @Body() updateWosQuotaYearDto: UpdateWosQuotaYearDto,
    ) {
        return this.apiKeysService.updateWosQuotaYear(+id, updateWosQuotaYearDto);
    }

    @Get('wos-quota-year')
    findAllWosQuotaYear(
        @Request() req,
        @Query('wosQuotaId') wosQuotaId: number,
        @Paginator() query: PaginatorQuery,
        ) {
        return this.apiKeysService.findAllWosQuotaYear(req, wosQuotaId, query);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Get('wos-quota-year/:id')
    findOneWosQuotaYear(
        @Param('id') id: number,
    ) {
        return this.apiKeysService.findOneWosQuotaYear({where: {id}});
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([Role.Admin])
    @Delete('wos-quota-year/:id')
    removeWosQuotaYear(@Param('id') id: string) {
        return this.apiKeysService.removeWosQuotaYear(+id);
    }

    @Post('api-keys/:wosQuotaId')
    create(
        @Request() req,
        @Param('wosQuotaId') wosQuotaId: number,
        @Body() createApiKeyDto: CreateApiKeyDto,
    ) {
        return this.apiKeysService.create(req, wosQuotaId, createApiKeyDto);
    }

    @Get('api-keys/:wosQuotaId')
    findAll(
        @Request() req,
        @Param('wosQuotaId') wosQuotaId: number,
        @Paginator() query: PaginatorQuery,
    ) {
        return this.apiKeysService.findAll(req, query, wosQuotaId);
    }

    @Get('api-key/:id')
    findOne(@Param('id') id: number) {
        return this.apiKeysService.findOne({where: {id}, relations: ['organization', 'user']});
    }

    @Patch('api-keys/:id')
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateApiKeyDto: UpdateApiKeyDto,
    ) {
        return this.apiKeysService.update(req, +id, updateApiKeyDto);
    }

    @Patch('api-keys/update-status/:id')
    updateStatus(
        @Request() req,
        @Param('id') id: string,
        @Body('is_active') is_active: boolean,
        ) {
        return this.apiKeysService.updateStatus(req, +id, is_active);
    }

    @Patch('api-keys/regenerate/:id')
    regenerate(@Request() req, @Param('id') id: string) {
        return this.apiKeysService.regenerate(req, +id);
    }

    @Delete('api-keys/:id')
    remove(@Request() req, @Param('id') id: string) {
        return this.apiKeysService.remove(req, +id);
    }
}
