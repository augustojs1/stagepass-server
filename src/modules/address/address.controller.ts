import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { AddressService } from './address.service';
import { JwtAuthGuard } from '../auth/guards';
import {
  forwardGeocoderDto,
  ForwardGeocoderDto,
  ForwardGeocoderResponse,
} from './dto';
import { ZodValidationPipe } from '../shared/pipes';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/geocoder/preview')
  async getPreviewAddress(
    @Req() req,
    @Query(new ZodValidationPipe(forwardGeocoderDto))
    forwardGeocoderDto: ForwardGeocoderDto,
  ): Promise<ForwardGeocoderResponse> {
    return await this.addressService.findPreviewAddress(forwardGeocoderDto);
  }
}
