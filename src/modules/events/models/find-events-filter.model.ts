export interface FindEventsFilter {
  page: number;
  per_page: number;
  search?: string;
  category_ids?: string[];
  is_free?: boolean;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}
