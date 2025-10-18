import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';

import * as schema from './schema';

dotenv.config({
  path: `${process.cwd()}/src/infra/config/env/${process.env.NODE_ENV}.env`,
});

export const DATABASE_TAG = 'STAGEPASS_DB';

@Module({
  imports: [
    DrizzlePostgresModule.register({
      tag: DATABASE_TAG,
      postgres: {
        url: 'postgres://postgres:@localhost:5432/stagepass_db',
        config: {
          host: 'localhost',
          port: 5432,
          user: 'stagepass_server',
          password: '60009172',
          database: 'stagepass_db',
        },
      },
      config: { schema: { ...schema } },
    }),
  ],
})
export class DrizzleModule {}
