export class UserTicketsDto {
  event_id: string;
  event_name: string;
  event_description: string;
  event_address_street: string;
  event_address_number: string;
  event_address_district: string;
  event_starts_at: Date;
  event_ends_at: Date;
  ticket_id: string;
  ticket_owner_id: string;
  ticket_file_url: string;
  ticket_code: string;
}
