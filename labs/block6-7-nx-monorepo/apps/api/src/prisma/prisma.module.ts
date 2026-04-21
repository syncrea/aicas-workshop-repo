import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Global so every domain module can inject `PrismaService` without re-importing
 * `PrismaModule` themselves. Domain modules should still own their own
 * controllers/services — only the database client is shared this way.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
