import { Controller, Get, Param } from '@nestjs/common';
import type { User, UserSummary } from '@aicas/shared-types';

import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(): Promise<UserSummary[]> {
    return this.users.list();
  }

  @Get('me')
  me(@CurrentUser() current: { id: string }): Promise<User> {
    return this.users.getById(current.id);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<User> {
    return this.users.getById(id);
  }
}
