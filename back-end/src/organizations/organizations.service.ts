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
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'organization.id',
            'organization.creation_date',
            'organization.update_date',
            'organization.name',
            'organization.acronym',
            'organization.code',
        ], 'organization.id');
    }

    findOne(id: number) {
        return this.organizationRepository.findOneBy({id});
    }

    remove(id: number) {
        return this.organizationRepository.delete({id});
    }

    async importPartners() {
        const partnersData = await firstValueFrom(
            this.httpService
                .get('https://api.clarisa.cgiar.org/api/institutions')
                .pipe(
                    map((d: any) => d.data),
                    catchError((error: AxiosError) => {
                        throw new InternalServerErrorException();
                    }),
                ),
        );
        for (let partner of partnersData) {
            let {added, institutionType, countryOfficeDTO, ...data} = partner;
            const entity = await this.organizationRepository.findOneBy({
                code: partner.code,
            });
            if (entity != null) {
                this.organizationRepository.update(entity.id, {...data});
            } else {
                const newPartner = this.organizationRepository.create(
                    data as Organization,
                );
                newPartner.id = partner.code;
                this.organizationRepository.save(newPartner);
            }
        }
    }
}
