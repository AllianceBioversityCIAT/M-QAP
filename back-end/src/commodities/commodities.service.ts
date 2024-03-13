import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {resolve} from 'path';
import {Commodity} from 'src/entities/commodities.entity';
import {Repository} from 'typeorm';
import {CreateCommoditiesDto} from './dto/create-commodities.dto';
import {UpdateCommoditiesDto} from './dto/update-commodities.dto';
const excelToJson = require('convert-excel-to-json');

@Injectable()
export class CommoditiesService extends TypeOrmCrudService<Commodity> {
    constructor(
        @InjectRepository(Commodity)
        public commoditiesRepository: Repository<Commodity>,
        private readonly paginatorService: PaginatorService,
    ) {
        super(commoditiesRepository);
    }

    create(createUserDto: Partial<CreateCommoditiesDto>) {
        const newUser = this.commoditiesRepository.create({...createUserDto});
        return this.commoditiesRepository.save(newUser);
    }

    public findAll(query: PaginatorQuery, parent: boolean): Promise<PaginatedQuery<Commodity>> {
        const queryBuilder = this.commoditiesRepository
            .createQueryBuilder('commodity')
            .select([
                'commodity.id AS id',
                'commodity.creation_date AS creation_date',
                'commodity.update_date AS update_date',
                'commodity.name AS name',
                'commodity.source AS source',
                'commodity.parent_id AS parent_id',
                'parent_commodity.name AS parent_name',
            ])
            .leftJoin('commodity', 'parent_commodity', 'parent_commodity.id = commodity.parent_id');

        if (parent) {
            queryBuilder.where('commodity.parent_id IS NULL');
        }

        return this.paginatorService.paginator(query, queryBuilder, [
            'commodity.id',
            'commodity.creation_date',
            'commodity.update_date',
            'commodity.name',
            'commodity.source',
            'commodity.parent_id',
            'parent_commodity.name',
        ], 'commodity.id');
    }

    public findOneByName(name: string): Promise<Commodity> {
        return this.findOne({where: {name}, relations: ['parent']});
    }

    async processSheet(fileName: string) {
        const filePath = resolve(process.cwd(), 'media', fileName);

        const recordsList: Array<{ A: string; B: string }> =
            excelToJson({sourceFile: filePath})?.Sheet1 ?? [];
        recordsList.pop();
        for await (const item of recordsList) {
            const commodity = await this.create({
                name: item.A,
                source: 'system/excel',
            }).catch(() => {
                console.info('Duplicated Parent : ', item.A);

                return this.findOneByName(item.A);
            });

            const names =
                ((item.B ?? '').split(',') ?? []).map((i) => i.trim()) ?? [];
            for await (const name of names) {
                await this.create({
                    name: name,
                    parent: commodity,
                    source: 'system/excel',
                }).catch(() => {
                    console.info('Duplicated Child : ', item.A);

                    return null;
                });
            }
        }
        return recordsList;
    }

    update(id: number, updateUserDto: UpdateCommoditiesDto) {
        return this.commoditiesRepository.update({id}, {...updateUserDto});
    }

    remove(id: number) {
        return this.commoditiesRepository.delete({id});
    }
}
