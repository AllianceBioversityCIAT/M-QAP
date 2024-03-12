import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import lodash_1 = require('lodash');

const multipleSplit = (param, res) => {
    const items = param.split(':');
    if (items.length === 2) {
        res.push(items);
    }
};
function parseParam(queryParam, parserLogic) {
    const res = [];
    if (queryParam) {
        const params = !Array.isArray(queryParam) ? [queryParam] : queryParam;
        for (const param of params) {
            if ((0, lodash_1.isString)(param)) {
                parserLogic(param, res);
            }
        }
    }
    return res.length ? res : undefined;
}

export const Paginator = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const query = request.query;

        const sortBy = parseParam(query.sortBy, multipleSplit);
        return {
            page: query.page ? parseInt(query.page.toString(), 10) : undefined,
            limit: query.limit ? parseInt(query.limit.toString(), 10) : undefined,
            sortBy,
            search: query.search ? query.search.toString() : undefined,
        };
    },
);