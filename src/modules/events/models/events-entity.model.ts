export class EventsEntity {
  id: string;
  organizer_id: string;
  event_category_id: string;
  name: string;
  description: string;
  slug: string;
  banner_url: string;
  is_free: boolean;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_district: string;
  address_city: string;
  country_id: string;
  location: string;
  starts_at: string;
  ends_at: string;
  updated_at: Date | string;
  created_at: Date | string;
}
