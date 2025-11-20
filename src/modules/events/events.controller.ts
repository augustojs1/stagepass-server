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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { EventsService } from './events.service';
import { CreateEventDto, createEventDtoSchema } from './dto/create-event.dto';
import { MultiFileValidationPipe, ZodValidationPipe } from '../shared/pipes';
import { JwtAuthGuard } from '../auth/guards';

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
  ) {
    return await this.eventsService.create(req.user.sub, createEventDto, files);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }
}
