export interface EventListItem {
  id: string;
  name: string;
  slug: string;
  banner_url: string | null;
  full_address: string;
  is_free: boolean;
  lowest_ticket_price: number | null;
  distance_km: number | null;
}
