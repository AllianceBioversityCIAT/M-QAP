import {BadRequestException, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {map} from 'rxjs/operators';
import {AI} from 'src/ai/ai.service';
import {DoiService} from 'src/doi/doi.service';
import {FormatService} from './formatter.service';
import * as licenses from './licenses.json';
import xlsx from 'node-xlsx';
import {HttpService} from '@nestjs/axios';
import {CommoditiesService} from 'src/commodities/commodities.service';
import {RepositoriesService} from 'src/repositories/repositories.service';
import {Repositories} from 'src/entities/repositories.entity';
import {RepositoriesSchema} from "../entities/repositories-schema.entity";
import {lastValueFrom} from 'rxjs';
import {ApiKey} from '../entities/api-key.entity';

const https = require('https');

@Injectable()
export class HandleService {
    Commodities;
    ClarisaRegions;
    private readonly logger = new Logger(HandleService.name);

    constructor(
        private http: HttpService,
        private formatService: FormatService,
        private commoditiesService: CommoditiesService,
        private repositoriesService: RepositoriesService,
        private doi: DoiService,
        private ai: AI,
    ) {
        this.initRegions();
    }

    async initRegions() {
        const workSheetsFromFile = await xlsx.parse(
            `${process.cwd() + '/assets'}/CLARISA_UN.xlsx`,
        );
        this.ClarisaRegions = {};
        workSheetsFromFile[0].data.forEach((d: any, i) => {
            if (i > 0) this.ClarisaRegions[d[1].toLocaleLowerCase()] = d[0];
        });
        this.logger.log('Clarisa Regions data Loaded');
    }

    async toClarisa(Items, predict = true) {
        if (!Array.isArray(Items)) Items = [Items];
        let result = [];
        for (let i in Items) {
            result.push({
                name: Items[i],
                prediction: predict ? await this.ai.makePrediction(Items[i]) : null,
            });
        }
        return result;
    }

    IsDOIOrHandle(link): any {
        //Replace %2F with /
        link = link.split('%2F');
        link = link.join('/');
        //Replace %3A with :
        link = link.split('%3A');
        link = link.join(':');

        try {
            //match the pattern of any part after a "\" or ":" as 2 digits followed by anything the a "/" followed by anything.
            //DOIs and Handles will follow this pattern, but it is not necessary all the matches are DOIs or Handles.
            const regex = /(?<=\/|\:|^)\d{2,}.*[^\/]\/[^\s]+/;
            const match = regex.exec(link);

            if (match !== null) {
                const matchArray = match[0].split('/');
                if (matchArray.length > 1) {
                    const prefix = matchArray.splice(0, 1)[0];
                    const suffix = matchArray.join('/');
                    return {
                        identifier: {
                            prefix,
                            suffix
                        },
                        domain: {
                            base_url: null,
                            id: null,
                        },
                    };
                }
            } else {
                const parsedUrl = new URL(link);

                // DSpace 7 links \items\UUID
                let regex = /(?<=\/items\/)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{11,12}/;
                let match = regex.exec(parsedUrl.pathname);

                let id = null;
                if (match !== null && match?.[0]) {
                    id = match[0];
                } else {
                    // CKAN links \dataset\ID
                    let regex = /(?<=\/dataset\/).*/;
                    let match = regex.exec(parsedUrl.pathname);
                    if (match !== null && match?.[0]) {
                        id = match[0].split('/')[0];
                    } else {
                        return false;
                    }
                }
                return {
                    identifier: {
                        prefix: null,
                        suffix: null
                    },
                    domain: {
                        base_url: parsedUrl.origin,
                        id,
                    },
                };
            }
        } catch (e) {
        }
        return false;
    }

    async getInfoBySchema(parsedLink): Promise<Repositories> {
        let where = {};
        if (parsedLink?.identifier?.prefix) {
            where = {prefix: parsedLink.identifier.prefix};
        } else if (parsedLink?.domain?.base_url) {
            where = {base_url: parsedLink.domain.base_url};
        } else {
            throw new BadRequestException(
                'The link provided is not supported by the M-QAP, as the repository is not included. Please get in touch with the PRMS technical support',
            );
        }
        const repository = await this.repositoriesService.findOne({
            where,
            relations: ['schemas'],
        });
        if (!repository)
            throw new BadRequestException(
                'The link provided is not supported by the M-QAP, as the repository is not included. Please get in touch with the PRMS technical support',
            );
        return repository;
    }

    async getIdentifier(repository: Repositories, id: string) {
        if (repository.type === 'DSpace7') {
            const data = await this.http
                .get(`${repository.api_path}/core/items/${id}`)
                .pipe(map((d) => d.data))
                .toPromise()
                .catch((e) => console.error(e));
            if (data) {
                return this.IsDOIOrHandle(data.handle);
            }
        } else if (repository.type === 'CKAN') {
            const data = await this.http
                .get(`${repository.api_path}/action/package_show?id=${id}`)
                .pipe(map((d) => d.data))
                .toPromise()
                .catch((e) => console.error(e));
            if (data) {
                return this.IsDOIOrHandle(data.result.identifier);
            }
        }
        return false;
    }

    async getCkan(prefix, suffix, repository: Repositories) {
        const baseUrl = repository.identifier_type === 'DOI' ? 'https://dx.doi.org' : 'https://hdl.handle.net';
        const idResult: any = await lastValueFrom(this.http
            .get(`${baseUrl}/${prefix}/${suffix}`)
        ).catch((e) => console.error(e));
        if (idResult && idResult?.status && idResult.status == 200 && idResult?.request?.res?.responseUrl) {
            const split = idResult.request.res.responseUrl.split('/');
            const id = split[split.length - 1];

            const result: any = await lastValueFrom(this.http
                .get(`${repository.api_path}/action/package_show?id=${id}`)
            ).catch((e) => console.error(e));
            if (result && result?.status && result.status == 200 && result?.data?.result) {
                const data = result.data.result;
                if (data) {
                    let formatted_data = this.formatService.format(
                        this.flatData(data, null, null, {organization: 'title'}),
                        repository,
                    );
                    formatted_data = this.addOn(formatted_data, repository);

                    formatted_data['repo'] = repository.name;
                    return formatted_data;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async getDataVerse(prefix, suffix, repository: Repositories) {
        const identifier = repository.identifier_type === 'DOI' ? 'doi' : 'hdl';
        const result: any = await lastValueFrom(this.http
            .get(`${repository.api_path}/datasets/:persistentId/?persistentId=${identifier}:${prefix}/${suffix}`, {
                headers: {
                    Accept: 'application/json',
                    cookie:
                        'incap_ses_288_2801958=/N6gO8gj1g4/4pnW2C7/A9DVbGMAAAAAW5jDWMnTcDMG7GaTE79mDg==; visid_incap_2801958=moDP+bZVRZ6D2SJehPzbxs/VbGMAAAAAQUIPAAAAAACXoHcOizPhxog6dcc30XRK; JSESSIONID=124ddc7e698f28720098b66aa429',
                    'User-Agent': 'CLARISA',
                },
                httpsAgent: new https.Agent({rejectUnauthorized: false}),
            })
        ).catch((e) => console.error(e));

        if (result && result?.status && result.status == 200 && result?.data?.data) {
            const data = result.data.data;
            if (data) {
                let formatted_data = this.formatService.format(
                    this.flatData(data, 'typeName', 'value'),
                    repository,
                );

                formatted_data = this.addOn(formatted_data, repository);

                formatted_data['repo'] = repository.name;
                return formatted_data;
            }
        } else {
            return false;
        }
    }

    async getCommodities(keywords: string[]) {
        if (!Array.isArray(keywords)) keywords = [keywords];
        keywords = keywords.map((i) => i.toLowerCase());
        const q = this.commoditiesService.commoditiesRepository
            .createQueryBuilder('commodity')
            .leftJoinAndSelect('commodity.parent', 'parentCommodity')
            .where('LOWER(commodity.name) IN(:keywords)', {keywords});

        const list = await q.getMany();
        return list.map((i) => i?.parent?.name ?? i.name);
    }

    addOn(formatted_data, repository: Repositories) {
        let addons = repository.schemas.filter((d: RepositoriesSchema) => d.formatter_addition);

        addons.forEach((schema) => {
            if (schema.formatter === 'combine') {
                formatted_data = this.combine(
                    formatted_data,
                    schema.target,
                    schema.formatter_addition,
                    repository,
                );
            } else if (schema.formatter === 'split') {
                formatted_data[schema.target] = formatted_data[schema.target]
                    .split(schema.formatter_addition)
                    .map((d: string) => d.trim());
            }
        });

        return formatted_data;
    }

    combine(data, src1, src2, repository: Repositories) {
        if (Array.isArray(data[src1])) {
            data[src1] = data[src1].map((d, i) => {
                let obj = {};
                obj[d] = data[src2][i];
                return obj;
            });
            let formatted = this.formatService.format(
                this.flatData(data[src1], '', ''),
                repository,
            );
            data = {...data, ...formatted};
            delete data[src1];
            delete data[src2];
        }
        return data;
    }

    flatData(data, aKey = null, aValue = null, key_value = {}) {
        let keys = Object.keys(key_value);
        let values: any = Object.values(key_value);
        let metadata = [];
        // not as what i want
        let flat = (data, aKey = null, aValue = null, key_value = {}) => {
            if (
                aKey &&
                aValue &&
                data[aKey] &&
                data.hasOwnProperty(aKey) &&
                data.hasOwnProperty(aValue) &&
                data[aValue] &&
                !Array.isArray(data[aValue]) &&
                typeof data[aValue] !== 'object'
            )
                metadata.push({key: data[aKey], value: data[aValue]});
            else if (typeof data == 'object' && data)
                Object.keys(data).forEach((key) => {
                    if (
                        aKey != key &&
                        typeof data[key] !== 'object' &&
                        !Array.isArray(data[key])
                    )
                        metadata.push({key, value: data[key]});
                    else if (Array.isArray(data[key]))
                        data[key].forEach((element) => {
                            flat(element, aKey, aValue);
                        });
                    else if (keys.indexOf(key) == -1) flat(data[key], aKey, aValue);
                    else if (keys.indexOf(key) > -1) {
                        metadata.push({
                            key: keys[keys.indexOf(key)],
                            value: data[key][values[keys.indexOf(key)]],
                        });
                    }
                });
        };
        flat(data, aKey, aValue);
        return {metadata};
    }

    toClarisaRegions(regions) {
        let arrayOfObjects = [];
        if (!Array.isArray(regions)) regions = [regions];
        regions.forEach((element) => {
            arrayOfObjects.push({
                name: element,
                clarisa_id: this.ClarisaRegions[element.toLowerCase()],
            });
        });
        return arrayOfObjects;
    }

    prepareHandleRequests(include: string[] = [], exclude: string[] = []) {
        const requestsMapper: any = {
            altmetric: true,
            cgiarRepository: true,
            doiInfo: true,
            institutionPrediction: true,
            agrovoc: true,
            commodities: true,
            orcid: true,
            fair: true,
        };

        if (include && include.length > 0) {
            Object.keys(requestsMapper).map(value => {
                if (include.indexOf(value) === -1) {
                    requestsMapper[value] = false;
                }
            });
        } else if (exclude && exclude.length > 0) {
            Object.keys(requestsMapper).map(value => {
                if (exclude.indexOf(value) !== -1) {
                    requestsMapper[value] = false;
                }
            });
        }

        return requestsMapper;
    }

    async getInfoByRepositoryLink(handle: string, apiKeyEntity: ApiKey, include: string[] = [], exclude: string[] = []) {
        if (!handle) {
            throw new HttpException(
                'Bad request valid handle must be provided',
                HttpStatus.BAD_REQUEST,
            );
        }
        let parsedLink = this.IsDOIOrHandle(handle);
        if (!parsedLink?.identifier?.prefix && !parsedLink?.domain?.id) {
            throw new BadRequestException('Please provide valid link.');
        }

        let repository = await this.getInfoBySchema(parsedLink);
        if (parsedLink?.domain?.id) {
            parsedLink = await this.getIdentifier(repository, parsedLink.domain.id);
            if (!parsedLink?.identifier?.prefix) {
                throw new BadRequestException('Please provide valid link.');
            }
            repository = await this.getInfoBySchema(parsedLink);
        }

        const {prefix, suffix} = parsedLink.identifier;

        const requestsMapper = this.prepareHandleRequests(include, exclude);

        let dataSources = [];

        if (requestsMapper?.altmetric) {
            dataSources.push(this.getAltmetricByHandle(prefix, suffix, repository.identifier_type));
        }

        let data: any = {};
        repository.schemas.map(schema => {
            data[schema.target] = null;
        });
        if (requestsMapper?.cgiarRepository) {
            if (repository.type == 'DSpace5') {
                data = {...data, ...(await this.getDpsace(prefix, suffix, repository))};
            } else if (repository.type == 'DSpace6') {
                data = {...data, ...(await this.getDpsace(prefix, suffix, repository))};
            } else if (repository.type == 'DSpace7') {
                data = {...data, ...(await this.getDpsace7(prefix, suffix, repository))};
            } else if (repository.type == 'Dataverse') {
                data = {...data, ...(await this.getDataVerse(prefix, suffix, repository))};
            } else if (repository.type == 'CKAN') {
                data = {...data, ...(await this.getCkan(prefix, suffix, repository))};
            }
        } else {
            if (repository.identifier_type === 'DOI') {
                data.Handle = `https://dx.doi.org/${prefix}/${suffix}`;
            } else {
                data.Handle = `https://hdl.handle.net/${prefix}/${suffix}`;
            }
        }

        const promisesMapper: any = {};
        if (requestsMapper?.altmetric) {
            promisesMapper.handle_altmetric = this.getAltmetricByHandle(prefix, suffix, repository.identifier_type);
        }

        if (data?.Affiliation) {
            promisesMapper.Affiliation = this.toClarisa(data.Affiliation, requestsMapper?.institutionPrediction);
        }

        if (data?.['Region of the research']) {
            data['Region of the research'] = this.toClarisaRegions(
                data['Region of the research'],
            );
        }

        if (requestsMapper?.cgiarRepository) {
            if (!data?.['Region of the research'] && !data?.['Countries']) {
                data['Geographic location'] = {
                    name: 'Global',
                    clarisa_id: 1,
                };
            }
        }

        if (data.hasOwnProperty('Funding source') && data['Funding source']) {
            promisesMapper['Funding source'] = this.toClarisa(data['Funding source'], requestsMapper?.institutionPrediction);
        }

        if (data?.Keywords) {
            if (!Array.isArray(data?.Keywords)) {
                data.Keywords = [data.Keywords];
            }
            promisesMapper['AGROVOC Keywords'] = requestsMapper?.agrovoc ? this.getAgrovocKeywords(data.Keywords) : null;
            promisesMapper['Commodities'] = requestsMapper?.commodities ? this.getCommodities(data.Keywords) : null;
        }

        if (data?.Countries) {
            let newArrayOfCountries = [];
            const toBeChange = {
                Congo: 'Congo, Democratic Republic of',
            };
            const toBeDeleted = ['Democratic Republic Of'];
            if (!Array.isArray(data?.Countries)) data.Countries = [data.Countries];
            data?.Countries.forEach((element) => {
                if (Array.isArray(element) && element.length > 1)
                    newArrayOfCountries.push(element.join(', '));
                else newArrayOfCountries.push(element);
            });
            const flattedArray = newArrayOfCountries.flat();
            newArrayOfCountries = [];
            flattedArray.forEach((element) => {
                if (toBeChange[element]) newArrayOfCountries.push(toBeChange[element]);
                else if (toBeDeleted.indexOf(element) == -1)
                    newArrayOfCountries.push(element);
            });
            data['Countries'] = newArrayOfCountries;
        }

        if (requestsMapper?.doiInfo) {
            if (data?.DOI || repository.identifier_type == 'DOI') {
                let doi = this.doi.isDOI(repository.identifier_type == 'DOI' ? (`${prefix}/${suffix}`) : data.DOI);
                if (doi) {
                    promisesMapper['DOI_Info'] = this.doi.getInfoByDOI(doi, apiKeyEntity, include, exclude);
                }
            }
        }

        if (data?.ORCID) {
            promisesMapper['ORCID_Data'] = requestsMapper?.orcid ? this.getORCID(data.ORCID) : null;
        }

        const promises = await Promise.all(Object.values(promisesMapper));
        Object.keys(promisesMapper).map((key, index) => {
            data[key] = promises?.[index];
        });

        data['FAIR'] = requestsMapper?.fair ? this.calculateFAIR(data) : null;

        return data;
    }

    calculateFAIR(data) {
        let FAIR = {
            score: {
                total: 0,
                F: 0,
                A: 0,
                I: 0,
                R: 0,
            },
            F: [
                {
                    name: 'F1',
                    description:
                        'The knowledge product is retrievable through its handle',
                    valid: true,
                },
                {
                    name: 'F2',
                    description:
                        'The knowledge product is described by rich metadata such as title, authors, description/abstract, and issue date',
                    valid:
                        (!!data['Issued date']) &&
                        (!!data.Title) &&
                        (!!data.Authors) &&
                        (!!data.Description),
                },
                {
                    name: 'F3',
                    description: 'At least one author is linked through their ORCID',
                    valid: data.ORCID_Data ? data.ORCID_Data && data.ORCID_Data.length > 0 : false,
                },
            ],
            A: [
                {
                    name: 'A1',
                    description: 'Metadata are retrievable through the handle',
                    valid: true,
                },
            ],
            I: [
                {
                    name: 'I1',
                    description: 'Metadata contain AGROVOC keywords',
                    valid: data?.agrovoc_keywords?.keywords ? data.agrovoc_keywords.keywords.length > 0 : false,
                },
                {
                    name: 'I2',
                    description:
                        'Metadata include qualified references to other (meta)data',
                    valid: data ? data.hasOwnProperty('Reference to other knowledge products') : false,
                },
            ],
            R: [
                {
                    name: 'R1',
                    description:
                        'The knowledge product is Open Access (OA) and has a clear and accessible usage license',
                    valid:
                        data['Open Access'] &&
                        (data['Open Access'] as string)
                            .toLocaleLowerCase()
                            .includes('open access') &&
                        licenses.indexOf(data['Rights']) >= 0,
                },
            ],
        };
        Object.keys(FAIR.score).forEach((key) => {
            if (key != 'total')
                FAIR.score[key] =
                    FAIR[key].filter((d) => d.valid).length / FAIR[key].length;
        });
        FAIR.score.total =
            Object.values(FAIR.score).reduce((partialSum, a) => partialSum + a, 0) /
            (Object.keys(FAIR.score).length - 1);
        Object.keys(FAIR.score).forEach((key) => {
            FAIR.score[key] = Number((FAIR.score[key] as number).toFixed(3));
        });

        return FAIR;
    }

    async getAgrovocKeywords(Keywords: [string]) {
        if (!Array.isArray(Keywords)) Keywords = [Keywords];
        let keywords_agro = [];
        Keywords.forEach((keyw) => {
            keywords_agro.push(
                this.http
                    .get(
                        `https://agrovoc.uniroma2.it/agrovoc/rest/v1/agrovoc/search?query=${keyw}`,
                    )
                    .pipe(
                        map((d) => {
                            return {keyword: keyw, is_agrovoc: d.data.results.length > 0};
                        }),
                    )
                    .toPromise()
                    .catch((e) => {
                        return {keyword: keyw, is_agrovoc: false};
                    }),
            );
        });
        const results = await Promise.all(keywords_agro);
        return {
            keywords: results.filter((d) => d.is_agrovoc).map((d) => d.keyword),
            results,
        };
    }

    async getORCID(orcids) {
        if (!Array.isArray(orcids)) orcids = [orcids];
        let toHit = [];
        orcids.forEach((orcid) => {
            const regex = /([A-Za-z0-9]{4}-){3}[A-Za-z0-9]{4}/gm;
            let match = regex.exec(orcid);
            if (match && match[0]) {
                orcid = match[0];
                toHit.push(
                    this.http
                        .get(`https://orcid.org/${orcid}`, {
                            headers: {Accept: 'application/json'},
                        })
                        .pipe(map((d) => d.data))
                        .toPromise()
                        .catch((e) => null),
                );
            }
        });
        if (toHit.length > 0)
            return await (await Promise.all(toHit)).filter((d) => d);
        else return [];
    }

    async getDpsace(prefix, suffix, repository) {
        const result: any = await lastValueFrom(this.http
            .get(`${repository.base_url}/rest/handle/${prefix}/${suffix}?expand=all`)
        ).catch((e) => console.error(e));
        if (result && result?.status && result.status == 200 && result?.data) {
            const data = result.data;
            const formatted_data = this.formatService.format(data, repository);
            formatted_data['repo'] = repository.name;
            return formatted_data;
        } else {
            return false;
        }
    }

    async getDpsace7(prefix, suffix, repository) {
        const result: any = await lastValueFrom(this.http
            .get(`${repository.api_path}/pid/find?id=${prefix}/${suffix}`)
        ).catch((e) => console.error(e));
        if (result && result?.status && result.status == 200 && result?.data) {
            const data = result.data;
            const metadata = [];
            Object.keys(data.metadata).map(field => {
                return data.metadata[field].map(value => {
                    metadata.push({
                        key: field,
                        value: value.value
                    });
                });
            });
            data.metadata = metadata;
            let formatted_data = this.formatService.format(data, repository);
            formatted_data['repo'] = repository.name;
            return formatted_data;
        } else {
            return false;
        }
    }

    async getAltmetricByHandle(prefix, suffix, identifier_type) {
        const result: any = await lastValueFrom(this.http
            .get(`https://api.altmetric.com/v1/${identifier_type === 'DOI' ? 'doi' : 'handle'}/${prefix}/${suffix}`)
        ).catch(() => null);
        if (result && result?.status && result.status == 200 && result?.data) {
            return result.data;
        } else {
            return null;
        }
    }
}
