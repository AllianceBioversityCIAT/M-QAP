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
            const where = [];
            const whereBinds = {};
            query.search.trim().split(' ').map((value, index) => {
                value = value.toString().trim();
                if (value !== '') {
                    where.push(`CONCAT_WS(' ', ${searchableColumns.join(',')}) LIKE :term_${index}`);
                    whereBinds[`term_${index}`] = `%${value}%`;
                }
            });
            if (where.length > 0) {
                selectQueryBuilder.andWhere(where.join(' AND '), whereBinds);
            }
        }

        const totalQuery = selectQueryBuilder
            .clone()
            .select([`COUNT(DISTINCT ${mainKey}) AS total`]);
        const totalRecords = await totalQuery.getRawOne();

        if (groupBy) {
            groupBy.map((group, index) => {
                if (index === 0) {
                    selectQueryBuilder.groupBy(group);
                } else {
                    selectQueryBuilder.addGroupBy(group);
                }
            });
        }

        query.limit = Number(query?.limit) > 0 ? query.limit : 50;
        if (query?.page != null) {
            selectQueryBuilder.offset((query.page - 1) * query.limit);
        }
        selectQueryBuilder.limit(query.limit);

        if (query?.sortBy) {
            query.sortBy.map(sort => {
                const direction = sort[1] === 'ASC' ? 'ASC' : 'DESC';
                selectQueryBuilder.orderBy(sort[0], direction);
            })
        }

        try {
            response.data = await selectQueryBuilder.execute();
            response.meta.totalItems = totalRecords && totalRecords?.total ? Number(totalRecords.total) : 0;
        } catch (e) {
        }
        return response;
    }
}