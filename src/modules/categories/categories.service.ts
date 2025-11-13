import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdateCategoryDto, CreateCategoryDto } from './dto';
import { CategoriesRepository } from './categories.repository';
import { CategoryEntity } from './models';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<void> {
    const existentCategory = await this.categoriesRepository.findByName(
      createCategoryDto.name,
    );

    if (existentCategory) {
      throw new ConflictException('Category with this name already exists!');
    }

    await this.categoriesRepository.create(createCategoryDto.name);
  }

  async findAll(): Promise<CategoryEntity[]> {
    return await this.categoriesRepository.findAll();
  }

  async findOneElseThrow(id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category with this Id not found!');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    const category = await this.findOneElseThrow(id);

    await this.categoriesRepository.update(category.id, updateCategoryDto.name);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOneElseThrow(id);

    await this.categoriesRepository.delete(category.id);
  }
}
