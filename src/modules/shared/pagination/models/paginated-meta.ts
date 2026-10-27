export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}
