import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { PrismaService } from '../prisma/prisma.service';

/**
 * Resolves the current user from the `X-User-Id` request header and attaches
 * it to `req.currentUser`. Endpoints that need a user pull it via the
 * `@CurrentUser()` decorator.
 *
 * The workshop deliberately avoids a real authentication system; the header
 * is the only "credential" the API understands. The frontend's user picker
 * is the closest thing to a login screen.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const userId = req.header('x-user-id');

    if (userId === undefined || userId === null || userId === '') {
      // Leave `currentUser` undefined; route guards decide whether that's OK.
      // (E.g. `GET /api/users` is public, `POST /api/projects` is not.)
      next();
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (user === null) {
      throw new UnauthorizedException(
        `Header X-User-Id refers to user "${userId}" which does not exist`,
      );
    }

    req.currentUser = user;
    next();
  }
}
