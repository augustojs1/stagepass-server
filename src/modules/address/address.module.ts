import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { GeocoderProvider } from './providers';

@Module({
  controllers: [AddressController],
  providers: [AddressService, GeocoderProvider, JwtService],
  exports: [AddressService],
})
export class AddressModule {}
