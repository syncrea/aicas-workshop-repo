import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Invite } from '@aicas/shared-types';

import { PrismaService } from '../prisma/prisma.service';
import { toInvite } from '../common/mappers';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(projectId: string): Promise<Invite[]> {
    await this.requireProjectExists(projectId);
    const rows = await this.prisma.invite.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { invitedBy: true },
    });
    return rows.map(toInvite);
  }

  async create(
    currentUserId: string,
    projectId: string,
    dto: CreateInviteDto,
  ): Promise<Invite> {
    await this.requireOwnerOrAdmin(currentUserId, projectId);

    const existing = await this.prisma.invite.findFirst({
      where: { projectId, email: dto.email, status: 'pending' },
    });
    if (existing !== null) {
      throw new ConflictException(
        `An invite for ${dto.email} is already pending on this project`,
      );
    }

    const created = await this.prisma.invite.create({
      data: {
        projectId,
        email: dto.email,
        role: dto.role,
        status: 'pending',
        invitedById: currentUserId,
      },
      include: { invitedBy: true },
    });
    return toInvite(created);
  }

  async revoke(currentUserId: string, projectId: string, inviteId: string): Promise<Invite> {
    await this.requireOwnerOrAdmin(currentUserId, projectId);

    const existing = await this.prisma.invite.findFirst({
      where: { id: inviteId, projectId },
    });
    if (existing === null) {
      throw new NotFoundException(`Invite ${inviteId} not found in project ${projectId}`);
    }
    if (existing.status !== 'pending') {
      throw new ConflictException(
        `Only pending invites can be revoked (this one is "${existing.status}")`,
      );
    }

    const updated = await this.prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'revoked', respondedAt: new Date() },
      include: { invitedBy: true },
    });
    return toInvite(updated);
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

  private async requireOwnerOrAdmin(currentUserId: string, projectId: string): Promise<void> {
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
    const isAdmin =
      membership !== null && (membership.role === 'owner' || membership.role === 'admin');
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only owners and admins can manage project invites');
    }
  }
}
