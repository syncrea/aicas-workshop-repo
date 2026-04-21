import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { CurrentUserMiddleware } from './current-user.middleware';

/**
 * Wires the {@link CurrentUserMiddleware} into every route under `/api/*`.
 * The middleware itself is harmless when no header is present — it just
 * leaves `req.currentUser` undefined and lets controllers decide whether
 * that's an error.
 */
@Module({})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
