import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as NodeGeocoder from 'node-geocoder';

import { ForwardGeocoderData, ForwardGeocoderResponse } from '../models';

@Injectable()
export class GeocoderService {
  private readonly geocoder: NodeGeocoder.Geocoder;

  constructor(private readonly configService: ConfigService) {
    const options: NodeGeocoder.Options = {
      provider: 'locationiq',
      apiKey: this.configService.get<string>('geocoder_api_key'),
      formatter: null,
    };

    this.geocoder = NodeGeocoder(options);
  }

  async forwardGeocode({
    complement,
    city,
    street,
  }: ForwardGeocoderData): Promise<ForwardGeocoderResponse | null> {
    const result = await this.geocoder.geocode(
      `${complement}, ${city}, ${street}`,
    );

    return (result[0] as ForwardGeocoderResponse) || null;
  }
}
