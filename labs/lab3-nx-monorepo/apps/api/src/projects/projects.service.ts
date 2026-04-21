import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Project } from '@aicas/shared-types';

import { PrismaService } from '../prisma/prisma.service';
import { toProject } from '../common/mappers';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const PROJECT_INCLUDE = {
  owner: true,
  _count: { select: { members: true, tasks: true } },
} as const;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: PROJECT_INCLUDE,
    });
    return rows.map(toProject);
  }

  async getById(id: string): Promise<Project> {
    const row = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    if (row === null) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return toProject(row);
  }

  async create(currentUserId: string, dto: CreateProjectDto): Promise<Project> {
    const created = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color ?? '#64748b',
        ownerId: currentUserId,
        members: {
          create: { userId: currentUserId, role: 'owner' },
        },
      },
      include: PROJECT_INCLUDE,
    });
    return toProject(created);
  }

  async update(currentUserId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.requireOwnerOrAdmin(currentUserId, id);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name === undefined ? {} : { name: dto.name }),
        ...(dto.description === undefined ? {} : { description: dto.description }),
        ...(dto.color === undefined ? {} : { color: dto.color }),
      },
      include: PROJECT_INCLUDE,
    });
    return toProject(updated);
  }

  async remove(currentUserId: string, id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (project === null) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    if (project.ownerId !== currentUserId) {
      throw new ForbiddenException('Only the project owner can delete a project');
    }

    await this.prisma.project.delete({ where: { id } });
  }

  /**
   * Throws `ForbiddenException` unless the current user is the owner or an
   * admin of the project. Used by mutations that change project state but
   * not by read endpoints — anyone can read.
   */
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
    const isAdmin = membership !== null && (membership.role === 'owner' || membership.role === 'admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only project owners and admins can change project settings',
      );
    }
  }
}
