import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import { CategoryEntity } from '@/modules/categories/models';

@Injectable()
export class CategoriesRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(name: string): Promise<void> {
    await this.drizzle.insert(schema.categories).values({
      name,
    });
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.drizzle.select().from(schema.categories);

    return categories;
  }

  async findById(category_id: string): Promise<CategoryEntity | null> {
    const category = await this.drizzle
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, category_id));

    return category[0] || null;
  }

  async update(category_id: string, name: string): Promise<void> {
    await this.drizzle
      .update(schema.categories)
      .set({
        name,
      })
      .where(eq(schema.categories.id, category_id));
  }

  async delete(category_id: string): Promise<void> {
    await this.drizzle
      .delete(schema.categories)
      .where(eq(schema.categories.id, category_id));
  }
}
