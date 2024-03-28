import {Expose} from 'class-transformer';
import {IsEnum, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export enum apiRequests {
    cgiarRepository = 'cgiarRepository',
    altmetric = 'altmetric',
    doiInfo = 'doiInfo',
    institutionPrediction = 'institutionPrediction',
    agrovoc = 'agrovoc',
    commodities = 'commodities',
    orcid = 'orcid',
    fair = 'fair',
    wos = 'wos',
    scopus = 'scopus',
    unpaywall = 'unpaywall',
    gardian = 'gardian',
    crossref = 'crossref',
}

export class LinkRequestDto {
    @ApiProperty()
    @Expose()
    @IsString()
    link: string;

    @ApiProperty({
        description: 'API requests to include. If defined, exclude will be ignored.',
        required: false,
        isArray: true,
        enum: apiRequests
    })
    @IsEnum(apiRequests, {each: true})
    @Expose()
    include: apiRequests[];

    @ApiProperty({
        description: 'API requests to exclude. If include is defined, this will be ignored.',
        required: false,
        isArray: true,
        enum: apiRequests
    })
    @IsEnum(apiRequests, {each: true})
    @Expose()
    exclude: apiRequests[];
}
