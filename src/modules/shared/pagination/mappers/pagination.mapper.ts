import { Injectable } from '@nestjs/common';

import { PaginatedResult } from './models/paginated-result';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class PaginationMapper {
  paginate<T>(
    data: T[],
    total: number,
    pagination: PaginationQueryDto,
  ): PaginatedResult<T> {
    const lastPage = Math.max(1, Math.ceil(total / pagination.per_page));

    return {
      data,
      meta: {
        page: pagination.page,
        per_page: pagination.per_page,
        total,
        last_page: lastPage,
        has_next_page: pagination.page < lastPage,
        has_previous_page: pagination.page > 1,
      },
    };
  }
}
