import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';
import { CategoriesModule } from '../categories/categories.module';
import { SlugProvider } from '../shared/providers';
import { DateProvider } from '../shared/providers/date.provider';
import {
  DiskStorageService,
  IStorageService,
  R2StorageService,
} from '@/infra/storage';
import { EventsStoragePathProvider } from './providers';
import { AddressModule } from '../address/address.module';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    EventsMapper,
    JwtService,
    SlugProvider,
    DateProvider,
    {
      provide: IStorageService,
      useClass: DiskStorageService,
    },
    R2StorageService,
    EventsStoragePathProvider,
  ],
  imports: [CategoriesModule, AddressModule],
})
export class EventsModule {}
