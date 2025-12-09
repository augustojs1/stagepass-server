export class CreateEventData {
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
  location: {
    x: number;
    y: number;
  };
  starts_at: Date;
  ends_at: Date;
}
