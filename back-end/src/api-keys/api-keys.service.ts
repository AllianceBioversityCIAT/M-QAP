import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {ApiKey} from '../entities/api-key.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Between, DataSource, FindOneOptions, Repository} from 'typeorm';
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
import {FindOptionsWhere} from "typeorm/find-options/FindOptionsWhere";
import {CreateWosQuotaYearDto} from "./dto/create-wos-quota-year.dto";
import {UpdateWosQuotaYearDto} from "./dto/update-wos-quota-year.dto";

@Injectable()
export class ApiKeysService extends TypeOrmCrudService<ApiKey> {
    constructor(
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
                throw new BadRequestException('Duplicated Quota');
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
                throw new BadRequestException('Duplicated Quota');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    public findAllWosQuota(query: PaginatorQuery): Promise<PaginatedQuery<WosQuota>> {
        const queryBuilder = this.wosQuotaRepository
            .createQueryBuilder('wos_quota')
            .select([
                'wos_quota.id AS id',
                'wos_quota.creation_date AS creation_date',
                'wos_quota.update_date AS update_date',
                'wos_quota.name AS name',
                'organization.acronym AS organization',
                'wos_quota.is_active AS is_active',
            ])
            .leftJoin('organization', 'organization', 'organization.id = wos_quota.organization_id');

        return this.paginatorService.paginator(query, queryBuilder, [
            'wos_quota.id',
            'wos_quota.creation_date',
            'wos_quota.update_date',
            'wos_quota.name',
            'organization.acronym',
            'IF(wos_quota.is_active = 1, "Yes", "No")',
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

    removeWosQuota(id: number) {
        return this.wosQuotaRepository.delete({id});
    }

    async createWosQuotaYear(wosQuotaId: number, createWosQuotaYearDto: Partial<CreateWosQuotaYearDto>) {
        try {
            createWosQuotaYearDto.wosQuota = await this.findOneWosQuota({where: {id: wosQuotaId}});
            const newRepository = this.wosQuotaYearRepository.create({...createWosQuotaYearDto});
            return await this.wosQuotaYearRepository.save(newRepository);
        } catch (error) {
            if (error.errno === 1062) {
                throw new BadRequestException('Duplicated Quota');
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
                throw new BadRequestException('Duplicated Quota');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    public findAllWosQuotaYear(wosQuotaId: number, query: PaginatorQuery): Promise<PaginatedQuery<WosQuotaYear>> {
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

    async create(wosQuotaId: number, createApiKeyDto: Partial<CreateApiKeyDto>) {
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
                throw new BadRequestException('Duplicated API-key');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    async update(id: number, updateApiKeyDto: UpdateApiKeyDto) {
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
                throw new BadRequestException('Duplicated API-key');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    public findAll(query: PaginatorQuery, wosQuotaId: number): Promise<PaginatedQuery<ApiKey>> {
        const queryBuilder = this.apiKeyRepository
            .createQueryBuilder('api_key')
            .select([
                'api_key.id AS id',
                'api_key.creation_date AS creation_date',
                'api_key.update_date AS update_date',
                'api_key.name AS name',
                'api_key.api_key AS api_key',
                'organization.acronym AS organization',
                'user.email AS user_email',
                'api_key.is_active AS is_active',
            ])
            .leftJoin('organization', 'organization', 'organization.id = api_key.organization_id')
            .leftJoin('user', 'user', 'user.id = api_key.user_id')
            .where('api_key.wos_quota_id = :wosQuotaId', {wosQuotaId})

        return this.paginatorService.paginator(query, queryBuilder, [
            'api_key.id',
            'api_key.creation_date',
            'api_key.update_date',
            'api_key.name',
            'api_key.api_key',
            'organization.acronym',
            'user.email',
            'api_key.is_active',
            'IF(api_key.is_active = 1, "Yes", "No")',
        ], 'api_key.id');
    }

    async updateStatus(id: number, is_active: boolean) {
        try {
            const updateApiKeyDto = {is_active} as UpdateApiKeyDto;
            return await this.apiKeyRepository.update({id}, {...updateApiKeyDto});
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    async regenerate(id: number) {
        try {
            const api_key = await this.GetUniqueApiKey();
            const updateApiKeyDto = {api_key} as UpdateApiKeyDto;
            return await this.apiKeyRepository.update({id}, {...updateApiKeyDto});
        } catch (error) {
            throw new InternalServerErrorException('Oops! something went wrong.');
        }
    }

    remove(id: number) {
        return this.apiKeyRepository.delete({id});
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

    async getApiUsage(apiKeyEntity: ApiKey, year: number = null) {
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        return await this.apiKeyUsageRepository.count({
            where: {
                apiKey: {id: apiKeyEntity.id},
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);
    }

    async getApiUsageDetails(apiKeyEntity: ApiKey, year: number = null) {
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        return await this.apiKeyUsageRepository.find({
            where: {
                apiKey: {id: apiKeyEntity.id},
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

    async getWosAvailableQuota(apiKeyEntity: ApiKey, year: number = (new Date()).getFullYear()) {
        const date = dayjs(`${year}-01-01`);
        const used = await this.apiKeyWosUsageRepository.count({
            where: {
                apiKey: {id: apiKeyEntity.id},
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);

        const quotaYear = await this.findOneWosQuotaYear({
            where: {
                year,
                wosQuota: {
                    id: apiKeyEntity.wosQuota.id
                }
            }
        });

        if (!quotaYear) {
            return {
                wosQuota: 0,
                used: 0,
                usedPercentage: 0,
                available: 0,
                availablePercentage: 0,
            };
        }

        const available = quotaYear.quota - used;
        const usedPercentage = Number(quotaYear.quota > 0 ? (used / quotaYear.quota * 100).toFixed(2) : 0);
        const availablePercentage = Number((100 - Number(usedPercentage)).toFixed(2));
        return {
            wosQuota: quotaYear.quota,
            used,
            usedPercentage,
            available,
            availablePercentage,
        };
    }

    async getApiWosUsageDetails(apiKeyEntity: ApiKey, year: number = null) {
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        return await this.apiKeyWosUsageRepository.find({
            where: {
                apiKey: {id: apiKeyEntity.id},
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);
    }

    async getApiKeysUsage(year: number = null) {
        const apiKeys = await this.find({
            relations: ['organization', 'user']
        });

        const usageData = {
            apiKeys: [],
            activeApiKeys: 0,
            activeApiKeysPercentage: 0,
            chartsData: {
                wosUsageOverTime: [],
                apiUsageOverTime: [],
                categories: [],
            },
            wosQuota: 0,
            wosRequests: 0,
            wosUsedPercentage: 0,
            wosAvailable: 0,
            wosAvailablePercentage: 0,
            apiRequests: 0,
            dois: 0,
            year,
        };

        const yearMonthsSeriesObject = this.getYearMonthsSeriesObject(year);
        usageData.chartsData.categories = Object.keys(yearMonthsSeriesObject);

        const dois = {};
        for (const index in apiKeys) {
            if (apiKeys.hasOwnProperty(index)) {
                const apiKey = apiKeys[index] as ApiKey;
                const wosUsage = await this.getWosAvailableQuota(apiKeys[index], year);
                const apiUsage = await this.getApiUsage(apiKeys[index], year);

                const apiKeyDetails = {
                    name: apiKey?.organization ? apiKey.organization.acronym : apiKey?.user ? apiKey.user.email : apiKey.name,
                    type: apiKey?.organization ? 'Organization' : apiKey?.user ? 'User' : 'Application',
                    wosUsage,
                    apiUsage,
                };
                usageData.apiKeys.push(apiKeyDetails);
                if (apiKey.is_active) {
                    usageData.activeApiKeys++;
                }

                usageData.wosQuota += wosUsage.wosQuota;
                usageData.wosRequests += wosUsage.used;
                usageData.apiRequests += apiUsage;

                const ApiUsageDetails = await this.getApiUsageDetails(apiKeys[index], year);
                const ApiUsageDetailsSeries = JSON.parse(JSON.stringify(yearMonthsSeriesObject));
                ApiUsageDetails.map(usage => {
                    const date = dayjs(usage.creation_date).format('MMM YYYY');
                    if (ApiUsageDetailsSeries.hasOwnProperty(date)) {
                        ApiUsageDetailsSeries[date]++;
                    }
                });
                usageData.chartsData.apiUsageOverTime.push({
                    name: apiKeyDetails.name,
                    data: Object.values(ApiUsageDetailsSeries),
                });

                const wosUsageDetails = await this.getApiWosUsageDetails(apiKeys[index], year);
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
                    name: apiKeyDetails.name,
                    data: Object.values(wosUsageDetailsSeries),
                });
            }
        }
        usageData.dois = Object.keys(dois).length;

        usageData.wosUsedPercentage = Number(usageData.wosQuota > 0 ? (usageData.wosRequests / usageData.wosQuota * 100).toFixed(2) : 0);
        usageData.wosAvailable = usageData.wosQuota - usageData.wosRequests;
        usageData.wosAvailablePercentage = Number((100 - Number(usageData.wosUsedPercentage)).toFixed(2));

        if (usageData.activeApiKeys > 0 && usageData.apiKeys.length > 0) {
            usageData.activeApiKeysPercentage = Number((usageData.activeApiKeys / usageData.apiKeys.length * 100).toFixed(2));
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

    async findAllSummary(query: PaginatorQuery, year: number): Promise<PaginatedQuery<any>> {
        const date = (year ? year : dayjs().get('year')).toString();
        const queryBuilder = this.dataSource
            .createQueryBuilder()
            .from('api_key', 'api_key')
            .select([
                'api_key.id AS id',
                `(CASE WHEN api_key.organization_id IS NOT NULL THEN organization.acronym
                WHEN api_key.user_id IS NOT NULL THEN user.email
                ELSE api_key.name
                END) AS name`,
                `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                WHEN api_key.user_id IS NOT NULL THEN "User"
                ELSE "Application"
                END) AS type`,
                'api_key.wos_quota AS wos_quota',
                'COUNT(DISTINCT api_key_wos_usage.id) AS used_wos_quota',
                'COUNT(DISTINCT api_key_usage.id) AS api_requests',
                'api_key.is_active AS is_active'
            ])
            .leftJoin('organization', 'organization', 'organization.id = api_key.organization_id')
            .leftJoin('user', 'user', 'user.id = api_key.user_id')
            .leftJoin('api_key_wos_usage', 'api_key_wos_usage', 'api_key_wos_usage.api_key_id = api_key.id AND YEAR(api_key_wos_usage.creation_date) = :date', {date})
            .leftJoin('api_key_usage', 'api_key_usage', 'api_key_usage.api_key_id = api_key.id AND YEAR(api_key_usage.creation_date) = :date', {date});

        return this.paginatorService.paginator(query, queryBuilder, [
            'api_key.id',
            `(CASE WHEN api_key.organization_id IS NOT NULL THEN organization.acronym
                        WHEN api_key.user_id IS NOT NULL THEN user.email
                        ELSE api_key.name
                        END)`,
            `(CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                        WHEN api_key.user_id IS NOT NULL THEN "User"
                        ELSE "Application"
                        END)`,
            'api_key.wos_quota',
            '(IF(api_key.is_active = 1, "Yes", "No")'
        ], 'api_key.id', ['api_key.id']);
    }

    public findAllDetails(query: PaginatorQuery, apiKeyId: number, type: string, year: number): Promise<PaginatedQuery<ApiKeyUsage | ApiKeyWosUsage>> {
        const date = year ? year : dayjs().get('year');
        if (type === 'wos') {
            const queryBuilder = this.apiKeyWosUsageRepository
                .createQueryBuilder('api_key_wos_usage')
                .select([
                    'api_key_wos_usage.id AS id',
                    'api_key_wos_usage.creation_date AS creation_date',
                    'api_key_wos_usage.doi AS doi',
                ])
                .where('YEAR(api_key_wos_usage.creation_date) = :date', {date})
                .andWhere('api_key_wos_usage.api_key_id = :apiKeyId', {apiKeyId});

            return this.paginatorService.paginator(query, queryBuilder, [
                'api_key_wos_usage.id',
                'api_key_wos_usage.creation_date',
                'api_key_wos_usage.doi',
            ], 'api_key_wos_usage.id');
        } else {
            const queryBuilder = this.apiKeyUsageRepository
                .createQueryBuilder('api_key_usage')
                .select([
                    'api_key_usage.id AS id',
                    'api_key_usage.creation_date AS creation_date',
                    'api_key_usage.path AS path',
                ])
                .where('YEAR(api_key_usage.creation_date) = :date', {date})
                .andWhere('api_key_usage.api_key_id = :apiKeyId', {apiKeyId});

            return this.paginatorService.paginator(query, queryBuilder, [
                'api_key_wos_usage.id',
                'api_key_wos_usage.creation_date',
                'api_key_wos_usage.doi',
            ], 'api_key_wos_usage.id');
        }
    }
}
