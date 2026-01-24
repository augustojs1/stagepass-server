import { BadRequestException, Injectable } from '@nestjs/common';

import { GeocoderProvider } from './providers';
import { ForwardGeocoderDto, ForwardGeocoderResponse } from './dto';

@Injectable()
export class AddressService {
  constructor(private readonly geocoderProvider: GeocoderProvider) {}

  async findPreviewAddress(
    forwardGeocoderDto: ForwardGeocoderDto,
  ): Promise<ForwardGeocoderResponse> {
    const geocodeResponse = await this.geocoderProvider.forwardGeocode({
      complement: forwardGeocoderDto.complement,
      street: forwardGeocoderDto.street,
      city: forwardGeocoderDto.city,
    });

    if (!geocodeResponse) {
      throw new BadRequestException('Invalid or non existent address!');
    }

    return geocodeResponse;
  }
}
