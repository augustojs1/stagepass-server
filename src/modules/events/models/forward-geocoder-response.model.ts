export class ForwardGeocoderResponse {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  country: string;
  city: string;
  state: string;
  zipcode?: string | undefined;
  streetName: string;
  streetNumber?: string | number | undefined;
  countryCode: string;
  provider: string;
}
