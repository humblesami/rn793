export type Pagination = {
  offset: number;
  record_count: number;
  per_page: number;
};
export type DbFilter = [string, string, any] | (DbFilter | 'and' | 'or')[];
export type QueryParams = {
  ordering?: string;
  grouping?: string;
  paging?: Pagination;
};
