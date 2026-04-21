import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { Member } from '@aicas/shared-types';

import { CurrentUser } from '../auth/current-user.decorator';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@Controller('projects/:projectId/members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@Param('projectId') projectId: string): Promise<Member[]> {
    return this.members.listForProject(projectId);
  }

  @Post()
  add(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Body() body: AddMemberDto,
  ): Promise<Member> {
    return this.members.add(current.id, projectId, body);
  }

  @Patch(':id')
  updateRole(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: UpdateMemberDto,
  ): Promise<Member> {
    return this.members.updateRole(current.id, projectId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.members.remove(current.id, projectId, id);
  }
}
