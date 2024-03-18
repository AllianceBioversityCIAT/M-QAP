import {BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {ApiKey} from '../entities/api-key.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Between, DataSource, FindOneOptions, In, Repository} from 'typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {CreateApiKeyDto} from './dto/create-api-key.dto';
import {UpdateApiKeyDto} from './dto/update-api-key.dto';
import {CreateApiKeyUsageDto} from './dto/create-api-key-usage.dto';
import {CreateApiKeyWosUsageDto} from './dto/create-api-key-wos-usage.dto';
import * as crypto from 'crypto';
import {ApiKeyUsage} from '../entities/api-key-usage.entity';
import {ApiKeyWosUsage} from '../entities/api-key-wos-usage.entity';
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions';
import * as dayjs from 'dayjs';
import {CreateWosQuotaDto} from './dto/create-wos-quota.dto';
import {WosQuota} from '../entities/wos-quota.entity';
import {UpdateWosQuotaDto} from './dto/update-wos-quota.dto';
import {WosQuotaYear} from '../entities/wos-quota-year.entity';
import {CreateWosQuotaYearDto} from './dto/create-wos-quota-year.dto';
import {UpdateWosQuotaYearDto} from './dto/update-wos-quota-year.dto';
import {lastValueFrom} from 'rxjs';
import {HttpService} from '@nestjs/axios';
import {PrivilegesService, AuthenticatedRequest} from '../auth/privileges.service';

@Injectable()
export class ApiKeysService extends TypeOrmCrudService<ApiKey> {
    constructor(
        private http: HttpService,
        private privilegesService: PrivilegesService,
        @InjectRepository(ApiKey)
        public apiKeyRepository: Repository<ApiKey>,
        @InjectRepository(ApiKeyUsage)
        public apiKeyUsageRepository: Repository<ApiKeyUsage>,
        @InjectRepository(WosQuota)
        public wosQuotaRepository: Repository<WosQuota>,
        @InjectRepository(WosQuotaYear)
        public wosQuotaYearRepository: Repository<WosQuotaYear>,
        @InjectRepository(ApiKeyWosUsage)
        public apiKeyWosUsageRepository: Repository<ApiKeyWosUsage>,
        private readonly dataSource: DataSource,
        private readonly paginatorService: PaginatorService,
    ) {
        super(apiKeyRepository);
    }

    async createWosQuota(createWosQuotaDto: Partial<CreateWosQuotaDto>) {
        try {
            createWosQuotaDto.is_active = true;

            const newRepository = this.wosQuotaRepository.create({...createWosQuotaDto});
            return await this.wosQuotaRepository.save(newRepository);
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated Quota.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    async updateWosQuota(id: number, updateWosQuotaDto: UpdateWosQuotaDto) {
        try {
            delete updateWosQuotaDto.is_active;

            return await this.wosQuotaRepository.update({id}, {...updateWosQuotaDto});
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated Quota.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    public findAllWosQuota(req: AuthenticatedRequest, query: PaginatorQuery): Promise<PaginatedQuery<WosQuota>> {
        const queryBuilder = this.wosQuotaRepository
            .createQueryBuilder('wos_quota')
            .select([
                'wos_quota.id AS id',
                'wos_quota.creation_date AS creation_date',
                'wos_quota.update_date AS update_date',
                'wos_quota.name AS name',
                'COALESCE(organization.acronym, organization.name) AS organization',
                'wos_quota.is_active AS is_active',
                'wos_quota.alert_on AS alert_on',
                'wos_quota.responsible_id AS responsible_id',
                'user_responsible.email AS responsible',
            ])
            .leftJoin('organization', 'organization', 'organization.id = wos_quota.organization_id')
            .leftJoin('api_key', 'api_key', 'api_key.wos_quota_id = wos_quota.id')
            .leftJoin('organization', 'api_key_organization', 'api_key_organization.id = api_key.organization_id')
            .leftJoin('user', 'api_key_user', 'api_key_user.id = api_key.user_id')
            .leftJoin('user', 'user_responsible', 'user_responsible.id = wos_quota.responsible_id');

        if (!this.privilegesService.isAdmin(req)) {
            queryBuilder.where('wos_quota.responsible_id = :responsibleId', {responsibleId: req.user.id});
        }

        return this.paginatorService.paginator(query, queryBuilder, [
            'wos_quota.id',
            'wos_quota.creation_date',
            'wos_quota.update_date',
            'wos_quota.name',
            'COALESCE(organization.acronym, organization.name)',
            'IF(wos_quota.is_active = 1, "Yes", "No")',
            'wos_quota.alert_on',
            'api_key.api_key',
            `(CASE WHEN api_key.organization_id IS NOT NULL THEN COALESCE(api_key_organization.acronym, api_key_organization.name)
                WHEN api_key.user_id IS NOT NULL THEN api_key_user.email
                ELSE api_key.name
                END)`,
            `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                WHEN api_key.user_id IS NOT NULL THEN "User"
                ELSE "Application"
                END)`,
            'user_responsible.email',
        ], 'wos_quota.id', ['wos_quota.id']);
    }

    public findOneWosQuota(findOneOptions: FindOneOptions): Promise<WosQuota> {
        return this.wosQuotaRepository.findOne(findOneOptions);
    }

    async updateStatusWosQuota(id: number, is_active: boolean) {
        try {
            const updateWosQuotaDto = {is_active} as UpdateWosQuotaDto;
            return await this.wosQuotaRepository.update({id}, {...updateWosQuotaDto});
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    async removeWosQuota(id: number) {
        try {
            return await this.wosQuotaRepository.delete({id});
        } catch (error) {
            if (error.errno === 1451) {
                throw new BadRequestException('Cannot delete, remove API-keys and quota years first.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    async createWosQuotaYear(wosQuotaId: number, createWosQuotaYearDto: Partial<CreateWosQuotaYearDto>) {
        try {
            createWosQuotaYearDto.wosQuota = await this.findOneWosQuota({where: {id: wosQuotaId}});
            const newRepository = this.wosQuotaYearRepository.create({...createWosQuotaYearDto});
            return await this.wosQuotaYearRepository.save(newRepository);
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated Quota.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    async updateWosQuotaYear(id: number, updateWosQuotaYearDto: UpdateWosQuotaYearDto) {
        try {
            return await this.wosQuotaYearRepository.update({id}, {...updateWosQuotaYearDto});
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated Quota.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    public findAllWosQuotaYear(req: AuthenticatedRequest, wosQuotaId: number, query: PaginatorQuery): Promise<PaginatedQuery<WosQuotaYear>> {
        const queryBuilder = this.wosQuotaYearRepository
            .createQueryBuilder('wos_quota_year')
            .select([
                'wos_quota_year.id AS id',
                'wos_quota_year.creation_date AS creation_date',
                'wos_quota_year.update_date AS update_date',
                'wos_quota_year.year AS year',
                'wos_quota_year.quota AS quota',
            ])
            .where('wos_quota_year.wos_quota_id = :wosQuotaId', {wosQuotaId});

        if (!this.privilegesService.isAdmin(req)) {
            queryBuilder
                .innerJoin('wos_quota', 'wos_quota', 'wos_quota.id = wos_quota_year.wos_quota_id')
                .andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: req.user.id});
        }

        return this.paginatorService.paginator(query, queryBuilder, [
            'wos_quota_year.id',
            'wos_quota_year.creation_date',
            'wos_quota_year.update_date',
            'wos_quota_year.year',
            'wos_quota_year.quota',
        ], 'wos_quota_year.id');
    }

    public findOneWosQuotaYear(findOneOptions: FindOneOptions): Promise<WosQuotaYear> {
        return this.wosQuotaYearRepository.findOne(findOneOptions);
    }

    removeWosQuotaYear(id: number) {
        return this.wosQuotaYearRepository.delete({id});
    }

    async create(req: AuthenticatedRequest, wosQuotaId: number, createApiKeyDto: Partial<CreateApiKeyDto>) {
        if (!(await this.privilegesService.canManageApiKey(req, wosQuotaId))) {
            throw new HttpException(
                `Cannot create, You don't have enough privileges.`,
                HttpStatus.UNAUTHORIZED,
            );
        }
        try {
            createApiKeyDto.wosQuota = await this.findOneWosQuota({where: {id: wosQuotaId}});

            if (createApiKeyDto.name) {
                createApiKeyDto.organization = null;
                createApiKeyDto.user = null;
            } else if (createApiKeyDto.organization) {
                createApiKeyDto.name = null;
                createApiKeyDto.user = null;
            } else if (createApiKeyDto.user) {
                createApiKeyDto.name = null;
                createApiKeyDto.organization = null;
            }

            createApiKeyDto.api_key = await this.GetUniqueApiKey();
            createApiKeyDto.is_active = true;

            const newRepository = this.apiKeyRepository.create({...createApiKeyDto});
            return await this.apiKeyRepository.save(newRepository);
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated API-key.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    async update(req: AuthenticatedRequest, id: number, updateApiKeyDto: UpdateApiKeyDto) {
        if (!(await this.privilegesService.canManageApiKey(req, null, id))) {
            throw new HttpException(
                `Cannot update, You don't have enough privileges.`,
                HttpStatus.UNAUTHORIZED,
            );
        }
        try {
            if (updateApiKeyDto.name) {
                updateApiKeyDto.organization = null;
                updateApiKeyDto.user = null;
            } else if (updateApiKeyDto.organization) {
                updateApiKeyDto.name = null;
                updateApiKeyDto.user = null;
            } else if (updateApiKeyDto.user) {
                updateApiKeyDto.name = null;
                updateApiKeyDto.organization = null;
            }
            delete updateApiKeyDto.api_key;
            delete updateApiKeyDto.is_active;

            return await this.apiKeyRepository.update({id}, {...updateApiKeyDto});
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated API-key.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    public findAll(req: AuthenticatedRequest, query: PaginatorQuery, wosQuotaId: number): Promise<PaginatedQuery<ApiKey>> {
        const queryBuilder = this.apiKeyRepository
            .createQueryBuilder('api_key')
            .select([
                'api_key.id AS id',
                'api_key.creation_date AS creation_date',
                'api_key.update_date AS update_date',
                'api_key.name AS name',
                'api_key.api_key AS api_key',
                'COALESCE(organization.acronym, organization.name) AS organization',
                'user.email AS user_email',
                'api_key.is_active AS is_active',
            ])
            .leftJoin('organization', 'organization', 'organization.id = api_key.organization_id')
            .leftJoin('user', 'user', 'user.id = api_key.user_id')
            .where('api_key.wos_quota_id = :wosQuotaId', {wosQuotaId});

        if (!this.privilegesService.isAdmin(req)) {
            queryBuilder
                .innerJoin('wos_quota', 'wos_quota', 'wos_quota.id = api_key.wos_quota_id')
                .andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: req.user.id});
        }

        return this.paginatorService.paginator(query, queryBuilder, [
            'api_key.id',
            'api_key.creation_date',
            'api_key.update_date',
            'api_key.name',
            'api_key.api_key',
            'COALESCE(organization.acronym, organization.name)',
            'user.email',
            'api_key.is_active',
            'IF(api_key.is_active = 1, "Yes", "No")',
        ], 'api_key.id');
    }

    async updateStatus(req: AuthenticatedRequest, id: number, is_active: boolean) {
        if (!(await this.privilegesService.canManageApiKey(req, null, id))) {
            throw new HttpException(
                `Cannot ${is_active ? 'activate' : 'deactivate'}, You don't have enough privileges.`,
                HttpStatus.UNAUTHORIZED,
            );
        }
        try {
            const updateApiKeyDto = {is_active} as UpdateApiKeyDto;
            return await this.apiKeyRepository.update({id}, {...updateApiKeyDto});
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    async regenerate(req: AuthenticatedRequest, id: number) {
        if (!(await this.privilegesService.canManageApiKey(req, null, id))) {
            throw new HttpException(
                `Cannot regenerate, You don't have enough privileges.`,
                HttpStatus.UNAUTHORIZED,
            );
        }
        try {
            const api_key = await this.GetUniqueApiKey();
            const updateApiKeyDto = {api_key} as UpdateApiKeyDto;
            return await this.apiKeyRepository.update({id}, {...updateApiKeyDto});
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    async remove(req: AuthenticatedRequest, id: number) {
        if (!(await this.privilegesService.canManageApiKey(req, null, id))) {
            throw new HttpException(
                `Cannot delete, You don't have enough privileges.`,
                HttpStatus.UNAUTHORIZED,
            );
        }
        try {
            return await this.apiKeyRepository.delete({id});
        } catch (error) {
            if (error.errno === 1451) {
                throw new BadRequestException('Cannot delete, API-key has usage logs.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    private GenerateApiKey() {
        const randomString = (new Date).getTime().toString() + Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();
        const hash = crypto.createHash('md5').update(randomString).digest('hex');
        return hash.toLowerCase().substring(0, 30).match(/.{1,6}/g).join('-');
    }

    private async GetUniqueApiKey() {
        let apiKey = '';
        while (apiKey === '') {
            apiKey = this.GenerateApiKey();
            const apiKeyRecord = await this.findOne({where: {api_key: apiKey}});
            if (apiKeyRecord) {
                apiKey = '';
            }
        }
        return apiKey;
    }

    async createApiUsage(apiKeyEntity: ApiKey, path) {
        try {
            const createApiKeyUsageDto = {
                apiKey: apiKeyEntity,
                path
            } as CreateApiKeyUsageDto;
            const newRepository = this.apiKeyUsageRepository.create({...createApiKeyUsageDto});
            return await this.apiKeyUsageRepository.save(newRepository);
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    async getQuotaApiUsage(apiKeyEntity: ApiKey = null, wosQuotaEntity: WosQuota = null, year: number = null) {
        if (!apiKeyEntity && !wosQuotaEntity) {
            return 0;
        }

        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        return await this.apiKeyUsageRepository.count({
            where: {
                apiKey: {
                    wosQuota: {
                        id: apiKeyEntity ? apiKeyEntity.wosQuota.id : wosQuotaEntity.id,
                    },
                },
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);
    }

    async getApiUsageDetails(apiKeyEntity: ApiKey = null, wosQuotaEntity: WosQuota = null, year: number = null) {
        if (!apiKeyEntity && !wosQuotaEntity) {
            return [];
        }
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        return await this.apiKeyUsageRepository.find({
            where: {
                apiKey: {
                    wosQuota: {
                        id: apiKeyEntity ? apiKeyEntity.wosQuota.id : wosQuotaEntity.id,
                    },
                },
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);
    }

    async createApiWosUsage(apiKeyEntity: ApiKey, doi: string) {
        try {
            const createApiKeyWosUsageDto = {
                apiKey: apiKeyEntity,
                doi
            } as CreateApiKeyWosUsageDto;
            const newRepository = this.apiKeyWosUsageRepository.create({...createApiKeyWosUsageDto});
            return await this.apiKeyWosUsageRepository.save(newRepository);
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    async getWosAvailableQuota(apiKeyEntity: ApiKey = null, wosQuotaEntity: WosQuota = null, year: number = (new Date()).getFullYear()) {
        const response = {
            wosQuota: 0,
            used: 0,
            usedPercentage: 0,
            available: 0,
            availablePercentage: 0,
        };

        if (!apiKeyEntity && !wosQuotaEntity) {
            return response;
        }

        const date = dayjs(`${year}-01-01`);
        const used = await this.apiKeyWosUsageRepository.count({
            where: {
                apiKey: {
                    wosQuota: {
                        id: apiKeyEntity ? apiKeyEntity.wosQuota.id : wosQuotaEntity.id,
                    },
                },
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);
        response.used = used;

        const quotaYear = await this.findOneWosQuotaYear({
            where: {
                year,
                wosQuota: {
                    id: apiKeyEntity ? apiKeyEntity.wosQuota.id : wosQuotaEntity.id,
                },
            },
        });

        if (!quotaYear) {
            return response;
        }
        response.wosQuota = quotaYear.quota;

        response.available = quotaYear.quota - used;
        response.usedPercentage = Number(quotaYear.quota > 0 ? (used / quotaYear.quota * 100).toFixed(2) : 0);
        response.availablePercentage = Number((100 - Number(response.usedPercentage)).toFixed(2));

        return response;
    }

    async getApiWosUsageDetails(apiKeyEntity: ApiKey = null, wosQuotaEntity: WosQuota = null, year: number = null) {
        if (!apiKeyEntity && !wosQuotaEntity) {
            return [];
        }
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        return await this.apiKeyWosUsageRepository.find({
            where: {
                apiKey: {
                    wosQuota: {
                        id: apiKeyEntity ? apiKeyEntity.wosQuota.id : wosQuotaEntity.id,
                    },
                },
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);
    }

    async getApiKeysUsage(req: AuthenticatedRequest, year: number = null) {
        const usageData = {
            apiKeys: 0,
            activeApiKeys: 0,
            activeApiKeysPercentage: 0,
            chartsData: {
                wosUsageOverTime: [],
                apiUsageOverTime: [],
                categories: [],
            },
            remainingWosQuota: 0,
            wosQuota: 0,
            wosRequests: 0,
            wosUsedPercentage: 0,
            wosAvailable: 0,
            wosAvailablePercentage: 0,
            apiRequests: 0,
            dois: 0,
            year,
        };

        let wosQuotas: WosQuota[] = [];
        if (!this.privilegesService.isAdmin(req)) {
            const apiKeys = await this.find({
                where: {
                    wosQuota: {
                        responsible: {
                            id: req.user.id,
                        },
                    },
                },
                relations: ['wosQuota'],
            } as FindManyOptions);

            const quotaIds = apiKeys.map((apiKey: ApiKey) => apiKey.wosQuota.id);
            if (quotaIds.length > 0) {
                wosQuotas = await this.wosQuotaRepository.find({
                    where: {
                        id: In(quotaIds)
                    },
                    relations: ['apiKey', 'organization'],
                } as FindManyOptions);
            } else {
                return usageData;
            }
        } else {
            wosQuotas = await this.wosQuotaRepository.find({
                relations: ['apiKey', 'organization'],
            });
        }

        usageData.remainingWosQuota = await this.getAvailableWosQuota();

        const yearMonthsSeriesObject = this.getYearMonthsSeriesObject(year);
        usageData.chartsData.categories = Object.keys(yearMonthsSeriesObject);

        const dois = {};
        for (const quotaIndex in wosQuotas) {
            if (wosQuotas.hasOwnProperty(quotaIndex)) {
                const wosQuota = wosQuotas[quotaIndex] as WosQuota;

                const wosUsage = await this.getWosAvailableQuota(null, wosQuota, year);
                const apiUsage = await this.getQuotaApiUsage(null, wosQuota, year);

                let wosQuotaName = wosQuota.name;
                if (wosQuota?.organization) {
                    if (wosQuota.organization?.acronym) {
                        wosQuotaName = `${wosQuota.organization.acronym} (${wosQuota.name})`;
                    } else {
                        wosQuotaName = `${wosQuota.organization.name} (${wosQuota.name})`;
                    }
                }

                wosQuota.apiKey.map((apiKey) => {
                    usageData.apiKeys++;
                    if (apiKey.is_active) {
                        usageData.activeApiKeys++;
                    }
                });

                usageData.wosQuota += wosUsage.wosQuota;
                usageData.wosRequests += wosUsage.used;
                usageData.apiRequests += apiUsage;

                const ApiUsageDetails = await this.getApiUsageDetails(null, wosQuota, year);
                const ApiUsageDetailsSeries = JSON.parse(JSON.stringify(yearMonthsSeriesObject));
                ApiUsageDetails.map(usage => {
                    const date = dayjs(usage.creation_date).format('MMM YYYY');
                    if (ApiUsageDetailsSeries.hasOwnProperty(date)) {
                        ApiUsageDetailsSeries[date]++;
                    }
                });
                usageData.chartsData.apiUsageOverTime.push({
                    name: wosQuotaName,
                    data: Object.values(ApiUsageDetailsSeries),
                });

                const wosUsageDetails = await this.getApiWosUsageDetails(null, wosQuota, year);
                const wosUsageDetailsSeries = JSON.parse(JSON.stringify(yearMonthsSeriesObject));
                wosUsageDetails.map(usage => {
                    if (usage?.doi && usage.doi !== '') {
                        dois[usage.doi] = usage.doi;
                    }
                    const date = dayjs(usage.creation_date).format('MMM YYYY');
                    if (wosUsageDetailsSeries.hasOwnProperty(date)) {
                        wosUsageDetailsSeries[date]++;
                    }
                });
                usageData.chartsData.wosUsageOverTime.push({
                    name: wosQuotaName,
                    data: Object.values(wosUsageDetailsSeries),
                });
            }
        }
        usageData.dois = Object.keys(dois).length;

        usageData.wosUsedPercentage = Number(usageData.wosQuota > 0 ? (usageData.wosRequests / usageData.wosQuota * 100).toFixed(2) : 0);
        usageData.wosAvailable = usageData.wosQuota - usageData.wosRequests;
        usageData.wosAvailablePercentage = Number((100 - Number(usageData.wosUsedPercentage)).toFixed(2));

        if (usageData.activeApiKeys > 0 && usageData.apiKeys > 0) {
            usageData.activeApiKeysPercentage = Number((usageData.activeApiKeys / usageData.apiKeys * 100).toFixed(2));
        }
        return usageData;
    }

    getYearMonthsSeriesObject(year: number) {
        let date = year ? dayjs(`${year}-01-01`) : dayjs();

        const yearMonthsSeriesObject: any = {};
        for (let i = 1; i <= 12; i++) {
            yearMonthsSeriesObject[date.format('MMM YYYY')] = 0;
            date = date.add(1, 'month');
        }
        return yearMonthsSeriesObject;
    }

    async findAllQuotaSummary(req: AuthenticatedRequest, query: PaginatorQuery, year: number = (new Date()).getFullYear()): Promise<PaginatedQuery<any>> {
        const queryBuilder = this.dataSource
            .createQueryBuilder()
            .from('wos_quota', 'wos_quota')
            .select([
                'wos_quota.id AS id',
                `(CASE WHEN wos_quota.organization_id IS NOT NULL THEN CONCAT(COALESCE(organization.acronym, organization.name), " (", wos_quota.name, ")")
                ELSE wos_quota.name
                END) AS name`,
                `(CASE WHEN wos_quota.organization_id IS NOT NULL THEN "Organization"
                ELSE "Application"
                END) AS type`,
                'wos_quota_year.quota AS quota',
                'COUNT(DISTINCT api_key.id) AS api_keys',
                'COUNT(DISTINCT api_key_wos_usage.id) AS used_wos_quota',
                'COUNT(DISTINCT api_key_usage.id) AS api_requests',
                'wos_quota.is_active AS is_active',
            ])
            .leftJoin('organization', 'organization', 'organization.id = wos_quota.organization_id')
            .leftJoin('user', 'user_responsible', 'user_responsible.id = wos_quota.responsible_id')
            .leftJoin('wos_quota_year', 'wos_quota_year', 'wos_quota_year.wos_quota_id = wos_quota.id AND wos_quota_year.year = :year', {year})
            .leftJoin('api_key', 'api_key', 'api_key.wos_quota_id = wos_quota.id')
            .leftJoin('organization', 'api_key_organization', 'api_key_organization.id = api_key.organization_id')
            .leftJoin('user', 'api_key_user', 'api_key_user.id = api_key.user_id')
            .leftJoin('api_key_wos_usage', 'api_key_wos_usage', 'api_key_wos_usage.api_key_id = api_key.id AND YEAR(api_key_wos_usage.creation_date) = :year', {year})
            .leftJoin('api_key_usage', 'api_key_usage', 'api_key_usage.api_key_id = api_key.id AND YEAR(api_key_usage.creation_date) = :year', {year});

        if (!this.privilegesService.isAdmin(req)) {
            queryBuilder.andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: req.user.id});
        }

        return this.paginatorService.paginator(query, queryBuilder, [
            'wos_quota.id',
            `(CASE WHEN wos_quota.organization_id IS NOT NULL THEN CONCAT(COALESCE(organization.acronym, organization.name), " (", wos_quota.name, ")")
                ELSE wos_quota.name
                END)`,
            `(CASE WHEN wos_quota.organization_id IS NOT NULL THEN "Organization"
                ELSE "Application"
                END)`,
            'wos_quota_year.quota',
            'IF(wos_quota.is_active = 1, "Yes", "No")',
            'api_key.api_key',
            `(CASE WHEN api_key.organization_id IS NOT NULL THEN COALESCE(api_key_organization.acronym, api_key_organization.name)
                WHEN api_key.user_id IS NOT NULL THEN api_key_user.email
                ELSE api_key.name
                END)`,
            `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                WHEN api_key.user_id IS NOT NULL THEN "User"
                ELSE "Application"
                END)`,
            'user_responsible.email',
        ], 'wos_quota.id', ['wos_quota.id']);
    }

    public findAllDetails(req: AuthenticatedRequest, query: PaginatorQuery, quotaId: number, type: string, year: number = (new Date()).getFullYear()): Promise<PaginatedQuery<ApiKeyUsage | ApiKeyWosUsage>> {
        if (type === 'wos') {
            const queryBuilder = this.apiKeyWosUsageRepository
                .createQueryBuilder('api_key_wos_usage')
                .select([
                    'api_key.api_key AS api_key',
                    `(CASE WHEN api_key.organization_id IS NOT NULL THEN COALESCE(organization.acronym, organization.name)
                        WHEN api_key.user_id IS NOT NULL THEN user.email
                        ELSE api_key.name
                        END) AS name`,
                    `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                        WHEN api_key.user_id IS NOT NULL THEN "User"
                        ELSE "Application"
                        END) AS type`,
                    'api_key_wos_usage.id AS id',
                    'api_key_wos_usage.creation_date AS creation_date',
                    'api_key_wos_usage.doi AS doi',
                ])
                .innerJoin('api_key', 'api_key', 'api_key.id = api_key_wos_usage.api_key_id')
                .leftJoin('organization', 'organization', 'organization.id = api_key.organization_id')
                .leftJoin('user', 'user', 'user.id = api_key.user_id')
                .where('YEAR(api_key_wos_usage.creation_date) = :year', {year})
                .andWhere('api_key.wos_quota_id = :quotaId', {quotaId});

            if (!this.privilegesService.isAdmin(req)) {
                queryBuilder
                    .innerJoin('wos_quota', 'wos_quota', 'wos_quota.id = api_key.wos_quota_id')
                    .andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: req.user.id});
            }

            return this.paginatorService.paginator(query, queryBuilder, [
                'api_key.api_key',
                `(CASE WHEN api_key.organization_id IS NOT NULL THEN COALESCE(organization.acronym, organization.name)
                    WHEN api_key.user_id IS NOT NULL THEN user.email
                    ELSE api_key.name
                    END)`,
                `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                    WHEN api_key.user_id IS NOT NULL THEN "User"
                    ELSE "Application"
                    END)`,
                'api_key_wos_usage.id',
                'api_key_wos_usage.creation_date',
                'api_key_wos_usage.doi',
            ], 'api_key_wos_usage.id');
        } else {
            const queryBuilder = this.apiKeyUsageRepository
                .createQueryBuilder('api_key_usage')
                .select([
                    'api_key.api_key AS api_key',
                    `(CASE WHEN api_key.organization_id IS NOT NULL THEN COALESCE(organization.acronym, organization.name)
                        WHEN api_key.user_id IS NOT NULL THEN user.email
                        ELSE api_key.name
                        END) AS name`,
                    `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                        WHEN api_key.user_id IS NOT NULL THEN "User"
                        ELSE "Application"
                        END) AS type`,
                    'api_key_usage.id AS id',
                    'api_key_usage.creation_date AS creation_date',
                    'api_key_usage.path AS path',
                ])
                .innerJoin('api_key', 'api_key', 'api_key.id = api_key_usage.api_key_id')
                .leftJoin('organization', 'organization', 'organization.id = api_key.organization_id')
                .leftJoin('user', 'user', 'user.id = api_key.user_id')
                .where('YEAR(api_key_usage.creation_date) = :year', {year})
                .andWhere('api_key.wos_quota_id = :quotaId', {quotaId});

            if (!this.privilegesService.isAdmin(req)) {
                queryBuilder
                    .innerJoin('wos_quota', 'wos_quota', 'wos_quota.id = api_key.wos_quota_id')
                    .andWhere('wos_quota.responsible_id = :responsibleId', {responsibleId: req.user.id});
            }

            return this.paginatorService.paginator(query, queryBuilder, [
                'api_key.api_key',
                `(CASE WHEN api_key.organization_id IS NOT NULL THEN COALESCE(organization.acronym, organization.name)
                    WHEN api_key.user_id IS NOT NULL THEN user.email
                    ELSE api_key.name
                    END)`,
                `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                    WHEN api_key.user_id IS NOT NULL THEN "User"
                    ELSE "Application"
                    END)`,
                'api_key_usage.id',
                'api_key_usage.creation_date',
                'api_key_usage.path',
            ], 'api_key_usage.id');
        }
    }

    async getAvailableWosQuota() {
        const response: any = await lastValueFrom(this.http
            .get(`${process.env.WOS_API_URL}?databaseId=WOS&usrQuery=AU=Garfield&count=0&firstRecord=1`, {
                headers: {
                    'X-ApiKey': `${process.env.WOS_API_KEY}`,
                },
            })
        ).catch((e) => e);
        return response?.headers?.['x-rec-amtperyear-remaining'] ? response.headers['x-rec-amtperyear-remaining'] : 0;
    }
}
