import { PaginatedResult } from '@/modules/shared/pagination/models';
import { EventItemPaginatedDto } from './event-item-paginated.dto';

export type EventsPaginatedResponseDto = PaginatedResult<EventItemPaginatedDto>;
