import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { EventsService } from './events.service';
import { CreateEventDto, createEventDtoSchema } from './dto/create-event.dto';
import { ZodValidationPipe } from '../shared/pipes';
import { JwtAuthGuard } from '../auth/guards';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('banner_image'))
  async create(
    @Req() req,
    @Body(new ZodValidationPipe(createEventDtoSchema))
    createEventDto: CreateEventDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image/ })
        .addMaxSizeValidator({
          maxSize: 7_000_000, // 7 MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    banner_image_file: Express.Multer.File,
  ) {
    return await this.eventsService.create(
      req.user.sub,
      createEventDto,
      banner_image_file,
    );
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
