import { Injectable, NotFoundException } from '@nestjs/common';
import type { User, UserSummary } from '@aicas/shared-types';

import { PrismaService } from '../prisma/prisma.service';
import { toUser, toUserSummary } from '../common/mappers';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<UserSummary[]> {
    const rows = await this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    return rows.map(toUserSummary);
  }

  async getById(id: string): Promise<User> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (row === null) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return toUser(row);
  }
}
