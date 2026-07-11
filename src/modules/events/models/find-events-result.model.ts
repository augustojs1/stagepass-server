import { EventListItem } from './event-list-item.model';

export interface FindEventsResult {
  items: EventListItem[];
  total: number;
}
