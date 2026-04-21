import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import type { Attachment } from '@aicas/shared-types';

import { CurrentUser } from '../auth/current-user.decorator';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentsService } from './attachments.service';

@Controller('projects/:projectId/attachments')
export class AttachmentsController {
  constructor(private readonly attachments: AttachmentsService) {}

  @Get()
  list(@Param('projectId') projectId: string): Promise<Attachment[]> {
    return this.attachments.listForProject(projectId);
  }

  @Post()
  create(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Body() body: CreateAttachmentDto,
  ): Promise<Attachment> {
    return this.attachments.create(current.id, projectId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.attachments.remove(current.id, projectId, id);
  }
}
