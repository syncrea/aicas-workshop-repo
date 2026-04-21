import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Attachment } from '@aicas/shared-types';

import { PrismaService } from '../prisma/prisma.service';
import { toAttachment } from '../common/mappers';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(projectId: string): Promise<Attachment[]> {
    await this.requireProjectExists(projectId);
    const rows = await this.prisma.attachment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: true },
    });
    return rows.map(toAttachment);
  }

  async create(
    currentUserId: string,
    projectId: string,
    dto: CreateAttachmentDto,
  ): Promise<Attachment> {
    await this.requireProjectMembership(currentUserId, projectId);
    const created = await this.prisma.attachment.create({
      data: {
        projectId,
        uploadedById: currentUserId,
        fileName: dto.fileName,
        contentType: dto.contentType,
        sizeBytes: dto.sizeBytes,
        storageKey: dto.storageKey,
      },
      include: { uploadedBy: true },
    });
    return toAttachment(created);
  }

  async remove(currentUserId: string, projectId: string, attachmentId: string): Promise<void> {
    await this.requireProjectMembership(currentUserId, projectId);
    const existing = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, projectId },
    });
    if (existing === null) {
      throw new NotFoundException(
        `Attachment ${attachmentId} not found in project ${projectId}`,
      );
    }
    await this.prisma.attachment.delete({ where: { id: attachmentId } });
  }

  private async requireProjectExists(projectId: string): Promise<void> {
    const exists = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (exists === null) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
  }

  private async requireProjectMembership(currentUserId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        members: {
          where: { userId: currentUserId },
          select: { role: true },
        },
      },
    });
    if (project === null) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    const membership = project.members[0] ?? null;
    const isOwner = project.ownerId === currentUserId;
    const isWriter =
      membership !== null &&
      (membership.role === 'owner' || membership.role === 'admin' || membership.role === 'member');
    if (!isOwner && !isWriter) {
      throw new ForbiddenException(
        'You must be a project member (or higher) to manage its attachments',
      );
    }
  }
}
