import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Organization} from 'src/entities/organization.entity';
import {Repository} from 'typeorm';
import {catchError, firstValueFrom, map} from 'rxjs';
import {HttpService} from '@nestjs/axios';
import {AxiosError} from 'axios';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';

@Injectable()
export class OrganizationsService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Organization)
        public organizationRepository: Repository<Organization>,
        private readonly paginatorService: PaginatorService,
    ) {
    }

    findAll(query: PaginatorQuery): Promise<PaginatedQuery<Organization>> {
        const queryBuilder = this.organizationRepository
            .createQueryBuilder('organization')
            .select([
                'organization.id AS id',
                'organization.creation_date AS creation_date',
                'organization.update_date AS update_date',
                'organization.name AS name',
                'organization.acronym AS acronym',
                'organization.code AS code',
                'organization.hq_location AS hq_location',
                'organization.hq_location_iso_alpha2 AS hq_location_iso_alpha2',
                'organization.institution_type AS institution_type',
                'organization.institution_type_id AS institution_type_id',
                'organization.website_link AS website_link',
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'organization.id',
            'organization.creation_date',
            'organization.update_date',
            'organization.name',
            'organization.acronym',
            'organization.code',
            'organization.hq_location',
            'organization.hq_location_iso_alpha2',
            'organization.institution_type',
            'organization.institution_type_id',
            'organization.website_link',
        ], 'organization.id');
    }

    findOne(id: number) {
        return this.organizationRepository.findOneBy({id});
    }

    remove(id: number) {
        return this.organizationRepository.delete({id});
    }

    async importPartners(partnersData = null) {
        if (!partnersData) {
            partnersData = await firstValueFrom(
                this.httpService
                    .get(process.env.CLARISA_API + '/institutions/simple')
                    .pipe(
                        map((d: any) => d.data),
                        catchError((e) => {
                            return [];
                        }),
                    ));
        }
        for (const partner of partnersData) {
            const partnerRecord = {
                name: partner.name,
                acronym: partner.acronym,
                code: partner.code,
                hq_location: partner.hqLocation,
                hq_location_iso_alpha2: partner.hqLocationISOalpha2,
                institution_type: partner.institutionType,
                institution_type_id: partner.institutionTypeId,
                website_link: partner.websiteLink,
            };
            const entity = await this.organizationRepository.findOneBy({
                code: partnerRecord.code,
            });
            if (entity != null) {
                this.organizationRepository.update(entity.id, {...partnerRecord});
            } else {
                const newPartner = this.organizationRepository.create(
                    partnerRecord as Organization,
                );
                this.organizationRepository.save(newPartner);
            }
        }
    }
}
