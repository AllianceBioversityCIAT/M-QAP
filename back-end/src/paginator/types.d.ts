export declare class PaginatedQuery<T> {
    data: T[];
    meta: {
        itemsPerPage: number;
        totalItems: number;
        currentPage: number;
        totalPages: number;
        sortBy: [string, 'ASC' | 'DESC'][];
    };
}
export interface PaginatorQuery {
    page?: number;
    limit?: number;
    sortBy?: [string, 'ASC' | 'DESC'][];
    search?: string;
}
