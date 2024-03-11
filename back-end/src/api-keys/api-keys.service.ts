import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {ApiKey} from '../entities/api-key.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Between, DataSource, FindOptionsWhere, Repository} from 'typeorm';
import {paginate, Paginated, PaginateQuery} from 'nestjs-paginate';
import {CreateApiKeyDto} from './dto/create-api-key.dto';
import {UpdateApiKeyDto} from './dto/update-api-key.dto';
import {CreateApiKeyUsageDto} from './dto/create-api-key-usage.dto';
import {CreateApiKeyWosUsageDto} from './dto/create-api-key-wos-usage.dto';
import * as crypto from 'crypto';
import {ApiKeyUsage} from '../entities/api-key-usage.entity';
import {ApiKeyWosUsage} from '../entities/api-key-wos-usage.entity';
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions';
import * as dayjs from 'dayjs';

@Injectable()
export class ApiKeysService extends TypeOrmCrudService<ApiKey> {
    constructor(
        @InjectRepository(ApiKey)
        public apiKeyRepository: Repository<ApiKey>,
        @InjectRepository(ApiKeyUsage)
        public apiKeyUsageRepository: Repository<ApiKeyUsage>,
        @InjectRepository(ApiKeyWosUsage)
        public apiKeyWosUsageRepository: Repository<ApiKeyWosUsage>,
        private readonly dataSource: DataSource,
    ) {
        super(apiKeyRepository);
    }

    async create(createApiKeyDto: Partial<CreateApiKeyDto>) {
        try {
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

    public findAll(query: PaginateQuery): Promise<Paginated<ApiKey>> {
        return paginate(query, this.apiKeyRepository, {
            sortableColumns: ['id', 'name', 'organization.name', 'user.email', 'wos_quota'],
            searchableColumns: ['id', 'name', 'organization.name', 'organization.acronym', 'user.full_name', 'user.email', 'wos_quota'],
            relations: ['organization', 'user'],
            select: [],
        });
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

    async getWosAvailableQuota(apiKeyEntity: ApiKey, year: number = null) {
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        const used = await this.apiKeyWosUsageRepository.count({
            where: {
                apiKey: {id: apiKeyEntity.id},
                creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
            }
        } as FindManyOptions);

        const available = Number(apiKeyEntity.wos_quota) - used;
        const usedPercentage = Number(apiKeyEntity.wos_quota > 0 ? (used / apiKeyEntity.wos_quota * 100).toFixed(2) : 0);
        const availablePercentage = Number((100 - Number(usedPercentage)).toFixed(2));
        return {
            wosQuota: apiKeyEntity.wos_quota,
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

    async findAllSummary(query: PaginateQuery, year: number) {
        const response = {
            data: [],
            meta: {
                itemsPerPage: query?.limit,
                totalItems: 0,
                currentPage: query?.page,
                totalPages: 0,
                sortBy: query?.sortBy
            },
            links: {
                current: `?page=${query.page}&limit=${query.limit}&sortBy=${query.sortBy}`
            }
        };
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
            .leftJoin('api_key_usage', 'api_key_usage', 'api_key_usage.api_key_id = api_key.id AND YEAR(api_key_usage.creation_date) = :date', {date})
            .groupBy('api_key.id');

        if (query?.search != null && query.search.trim() !== '') {
            const where = [];
            const whereBinds = {};
            query.search.trim().split(' ').map((value, index) => {
                value = value.toString().trim();
                if (value !== '') {
                    where.push(`CONCAT_WS(' ',
                        api_key.id,
                        (CASE WHEN api_key.organization_id IS NOT NULL THEN organization.acronym
                        WHEN api_key.user_id IS NOT NULL THEN user.email
                        ELSE api_key.name
                        END),
                        (CASE WHEN api_key.organization_id IS NOT NULL THEN "Organization"
                        WHEN api_key.user_id IS NOT NULL THEN "User"
                        ELSE "Application"
                        END),
                        api_key.wos_quota,
                        (IF(api_key.is_active = 1, "Yes", "No"))
                        ) LIKE :term_${index}`);
                    whereBinds[`term_${index}`] = `%${value}%`;
                }
            });
            if (where.length > 0) {
                queryBuilder.andWhere(where.join(' AND '), whereBinds);
            }
        }

        const totalQuery = queryBuilder
            .clone()
            .select(['COUNT(api_key.id) AS total']);
        const totalRecords = await totalQuery.getRawOne();

        query.limit = Number(query?.limit) > 0 ? query.limit : 50;
        if (query?.page != null) {
            queryBuilder.offset((query.page - 1) * query.limit);
        }
        queryBuilder.limit(query.limit);

        if (query?.sortBy) {
            query.sortBy.map(sort => {
                const direction = sort[1] === 'ASC' ? 'ASC' : 'DESC';
                queryBuilder.orderBy(sort[0], direction);
            })
        }

        try {
            response.data = await queryBuilder.execute();
            response.meta.totalItems = totalRecords && totalRecords?.total ? Number(totalRecords.total) : 0;
            return response;
        } catch (e) {
            return response;
        }
    }

    public findAllDetails(query: PaginateQuery, apiKeyId: number, type: string, year: number): Promise<Paginated<ApiKeyUsage | ApiKeyWosUsage>> {
        const date = year ? dayjs(`${year}-01-01`) : dayjs();
        if (type === 'wos') {
            return paginate(query, this.apiKeyWosUsageRepository, {
                sortableColumns: ['id', 'creation_date', 'doi'],
                searchableColumns: ['id', 'creation_date', 'doi'],
                relations: [],
                select: [],
                where: {
                    apiKey: {id: apiKeyId},
                    creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
                } as FindOptionsWhere<any>
            });
        } else {
            return paginate(query, this.apiKeyUsageRepository, {
                sortableColumns: ['id', 'creation_date', 'path'],
                searchableColumns: ['id', 'creation_date', 'path'],
                relations: [],
                select: [],
                where: {
                    apiKey: {id: apiKeyId},
                    creation_date: Between(date.startOf('year').toDate(), date.endOf('year').toDate())
                } as FindOptionsWhere<any>
            });
        }
    }
}
