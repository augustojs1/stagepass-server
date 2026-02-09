import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';

import { EventsService } from './events.service';
import {
  CreateEventDto,
  createEventDtoSchema,
} from './dto/request/create-event.dto';
import { ZodValidationPipe } from '../shared/pipes';
import { JwtAuthGuard } from '../auth/guards';
import {
  BannerImageUploadPresignDto,
  BannerrUploadDto,
  BannerUpdateResponseDto,
  bannerUploadDtoSchema,
  CreateEventResponseDto,
  EventsWithTicketsAndImagesDto,
  GalleryImagesPresignDto,
  galleryImagesPresignDtoSchema,
  updateEventImagesDto,
  UpdateEventImagesDto,
} from './dto';
import { PreSignedResponse } from '@/infra/storage/models';
import { GalleryImagesPresignUrlsResponse } from './dto/response/gallery-images-pre-sign-urls-response.dto';
import { uploadPresignPayloadSchema } from '@/infra/storage/models/upload-pre-sign-payload';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body(new ZodValidationPipe(createEventDtoSchema))
    createEventDto: CreateEventDto,
  ): Promise<CreateEventResponseDto> {
    return await this.eventsService.create(req.user.sub, createEventDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/banner/pre-sign')
  async createEventBannerPresign(
    @Req() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(uploadPresignPayloadSchema))
    bannerImagePreSignDto: BannerImageUploadPresignDto,
  ): Promise<PreSignedResponse> {
    return await this.eventsService.createBannerUploadPresignUrl(
      id,
      req.user.sub,
      bannerImagePreSignDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id/banner')
  async updateEventBanner(
    @Req() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(bannerUploadDtoSchema))
    bannerUploadDto: BannerrUploadDto,
  ): Promise<BannerUpdateResponseDto> {
    return await this.eventsService.updateBanner(
      id,
      req.user.sub,
      bannerUploadDto.banner_key,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/gallery-images/pre-sign')
  async createEventGalleryImagesPresign(
    @Req() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(galleryImagesPresignDtoSchema))
    galleryImagesPresignDto: GalleryImagesPresignDto,
  ): Promise<GalleryImagesPresignUrlsResponse> {
    return await this.eventsService.createGalleryImagesUploadPresignUrl(
      id,
      req.user.sub,
      galleryImagesPresignDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/gallery-images')
  async updateGalleryImages(
    @Req() req,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(updateEventImagesDto))
    updateEventImagesDto: UpdateEventImagesDto,
  ): Promise<void> {
    return await this.eventsService.createEventImagesGallery(
      id,
      req.user.sub,
      updateEventImagesDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:identifier/tickets')
  async getEventWithTickets(
    @Param('identifier') identifier: string,
  ): Promise<EventsWithTicketsAndImagesDto> {
    return await this.eventsService.findEventWithTickets(identifier);
  }
}
