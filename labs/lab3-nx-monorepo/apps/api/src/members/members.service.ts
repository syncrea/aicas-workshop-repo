import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Member } from '@aicas/shared-types';

import { PrismaService } from '../prisma/prisma.service';
import { toMember } from '../common/mappers';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(projectId: string): Promise<Member[]> {
    await this.requireProjectExists(projectId);
    const rows = await this.prisma.member.findMany({
      where: { projectId },
      orderBy: { joinedAt: 'asc' },
      include: { user: true },
    });
    return rows.map(toMember);
  }

  async add(currentUserId: string, projectId: string, dto: AddMemberDto): Promise<Member> {
    await this.requireOwnerOrAdmin(currentUserId, projectId);

    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (userExists === null) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    const existing = await this.prisma.member.findUnique({
      where: { projectId_userId: { projectId, userId: dto.userId } },
    });
    if (existing !== null) {
      throw new ConflictException(
        `User ${dto.userId} is already a member of project ${projectId}`,
      );
    }

    const created = await this.prisma.member.create({
      data: { projectId, userId: dto.userId, role: dto.role },
      include: { user: true },
    });
    return toMember(created);
  }

  async updateRole(
    currentUserId: string,
    projectId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<Member> {
    await this.requireOwnerOrAdmin(currentUserId, projectId);

    const existing = await this.prisma.member.findFirst({
      where: { id: memberId, projectId },
      include: { user: true },
    });
    if (existing === null) {
      throw new NotFoundException(`Member ${memberId} not found in project ${projectId}`);
    }

    // Prevent demoting the last owner — somebody has to own the project.
    if (existing.role === 'owner' && dto.role !== 'owner') {
      const ownerCount = await this.prisma.member.count({
        where: { projectId, role: 'owner' },
      });
      if (ownerCount <= 1) {
        throw new ConflictException(
          'Cannot demote the last owner; promote another member to owner first',
        );
      }
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: { user: true },
    });
    return toMember(updated);
  }

  async remove(currentUserId: string, projectId: string, memberId: string): Promise<void> {
    await this.requireOwnerOrAdmin(currentUserId, projectId);

    const existing = await this.prisma.member.findFirst({
      where: { id: memberId, projectId },
    });
    if (existing === null) {
      throw new NotFoundException(`Member ${memberId} not found in project ${projectId}`);
    }
    if (existing.role === 'owner') {
      const ownerCount = await this.prisma.member.count({
        where: { projectId, role: 'owner' },
      });
      if (ownerCount <= 1) {
        throw new ConflictException(
          'Cannot remove the last owner; assign a new owner first',
        );
      }
    }

    await this.prisma.member.delete({ where: { id: memberId } });
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
      throw new ForbiddenException('Only owners and admins can manage project members');
    }
  }
}
