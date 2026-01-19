import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { EventsService } from './events.service';
import {
  CreateEventDto,
  createEventDtoSchema,
} from './dto/request/create-event.dto';
import { MultiFileValidationPipe, ZodValidationPipe } from '../shared/pipes';
import { JwtAuthGuard } from '../auth/guards';
import {
  BannerImageUploadPresignDto,
  BannerrUploadDto,
  BannerUpdateResponseDto,
  CreateEventResponseDto,
} from './dto';
import { PreSignedResponse } from '@/infra/storage/models';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner_image', maxCount: 1 },
      { name: 'images', maxCount: 8 },
    ]),
  )
  async create(
    @Req() req,
    @Body(new ZodValidationPipe(createEventDtoSchema))
    createEventDto: CreateEventDto,
    @UploadedFiles(
      new MultiFileValidationPipe({
        maxSize: 7_000_000,
        fileTypes: [/^image\//],
      }),
    )
    files: {
      banner_image?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ): Promise<CreateEventResponseDto> {
    return await this.eventsService.create(req.user.sub, createEventDto, files);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/banner/pre-sign')
  async createEventBannerPresign(
    @Req() req,
    @Param('id') id: string,
    @Body() bannerImagePreSignDto: BannerImageUploadPresignDto,
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
    @Param('id') id: string,
    @Body() bannerUploadDto: BannerrUploadDto,
  ): Promise<BannerUpdateResponseDto> {
    return await this.eventsService.updateBanner(
      id,
      bannerUploadDto.banner_key,
    );
  }
}
