import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { Invite } from '@aicas/shared-types';

import { CurrentUser } from '../auth/current-user.decorator';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InvitesService } from './invites.service';

@Controller('projects/:projectId/invites')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Get()
  list(@Param('projectId') projectId: string): Promise<Invite[]> {
    return this.invites.listForProject(projectId);
  }

  @Post()
  create(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Body() body: CreateInviteDto,
  ): Promise<Invite> {
    return this.invites.create(current.id, projectId, body);
  }

  @Delete(':id')
  revoke(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<Invite> {
    return this.invites.revoke(current.id, projectId, id);
  }
}
