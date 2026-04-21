import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Pulls the current user (resolved by {@link CurrentUserMiddleware}) off the
 * request. Throws `UnauthorizedException` if the request has no current user
 * — controllers that allow anonymous access should use `@OptionalCurrentUser`
 * instead.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { id: string; email: string; name: string } => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.currentUser;

    if (user === undefined) {
      throw new UnauthorizedException(
        'Request is missing X-User-Id header (no current user resolved)',
      );
    }

    return user;
  },
);

/** Same as {@link CurrentUser} but returns `null` instead of throwing. */
export const OptionalCurrentUser = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): { id: string; email: string; name: string } | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.currentUser ?? null;
  },
);
