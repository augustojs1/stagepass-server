import { PaginationMeta } from './paginated-meta';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
