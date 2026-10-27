import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import {
  UpdateCategoryDto,
  CreateCategoryDto,
  updateCategoryDtoSchema,
  createCategoryDtoSchema,
} from './dto';
import { AdminUserGuard, JwtAuthGuard } from '../auth/guards';
import { CategoryEntity } from './models';
import { ZodValidationPipe } from '../shared/pipes';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, AdminUserGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(createCategoryDtoSchema))
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<void> {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminUserGuard)
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateCategoryDtoSchema))
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, AdminUserGuard)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return await this.categoriesService.remove(id);
  }
}
