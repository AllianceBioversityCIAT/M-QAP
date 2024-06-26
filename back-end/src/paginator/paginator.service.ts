import {PaginatedQuery, PaginatorQuery} from './types';
import {ObjectLiteral, SelectQueryBuilder} from 'typeorm';
import {Injectable} from '@nestjs/common';

@Injectable()
export class PaginatorService {
    async paginator<T extends ObjectLiteral>(query: PaginatorQuery, selectQueryBuilder: SelectQueryBuilder<T>, searchableColumns: string[], mainKey: string, groupBy?: string[]): Promise<PaginatedQuery<T>> {
        const response = {
            data: [],
            meta: {
                itemsPerPage: query?.limit,
                totalItems: 0,
                currentPage: query?.page,
                totalPages: 0,
                sortBy: query?.sortBy,
            },
        } as PaginatedQuery<T>;

        if (query?.search != null && query.search.trim() !== '') {
            const searchQuery = this.buildSearchQuery(query.search, searchableColumns);
            if (searchQuery.where !== '' && Object.keys(searchQuery.binds).length > 0) {
                selectQueryBuilder.andWhere(searchQuery.where, searchQuery.binds);
            }
        }

        const totalQuery = selectQueryBuilder
            .clone()
            .select([`${mainKey} AS id`]);
        const totalRecords = await totalQuery.getCount();

        if (groupBy) {
            groupBy.map((group, index) => {
                if (index === 0) {
                    selectQueryBuilder.groupBy(group);
                } else {
                    selectQueryBuilder.addGroupBy(group);
                }
            });
        }

        if (query.limit != -1) {
            query.limit = Number(query?.limit) > 0 ? query.limit : 50;
            if (query?.page != null) {
                selectQueryBuilder.offset((query.page - 1) * query.limit);
            }
            selectQueryBuilder.limit(query.limit);
        }

        if (query?.sortBy) {
            query.sortBy.map(sort => {
                const direction = sort[1] === 'ASC' ? 'ASC' : 'DESC';
                selectQueryBuilder.orderBy(sort[0], direction);
            })
        }

        response.data = await selectQueryBuilder.execute();
        response.meta.totalItems = totalRecords ? Number(totalRecords) : 0;
        return response;
    }

    buildSearchQuery(search: string, searchableColumns: string[]) {
        const where = [];
        const whereBinds = {};
        search.trim().split(' ').map((value, index) => {
            value = value.toString().trim();
            if (value !== '') {
                where.push(`CONCAT_WS(' ', ${searchableColumns.join(',')}) LIKE :term_${index}`);
                whereBinds[`term_${index}`] = `%${value}%`;
            }
        });
        return {
            where: where.join(' AND '),
            binds: whereBinds,
        }
    }
}