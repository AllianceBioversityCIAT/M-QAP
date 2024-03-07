import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {ApiKey} from '../entities/api-key.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {paginate, Paginated, PaginateQuery} from 'nestjs-paginate';
import {CreateApiKeyDto} from './dto/create-api-key.dto';
import {UpdateApiKeyDto} from './dto/update-api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService extends TypeOrmCrudService<ApiKey> {
    constructor(
        @InjectRepository(ApiKey)
        public apiKeyRepository: Repository<ApiKey>,
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
            console.log(error)
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
}
