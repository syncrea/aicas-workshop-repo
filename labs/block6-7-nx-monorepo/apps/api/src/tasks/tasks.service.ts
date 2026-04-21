import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '@aicas/shared-types';

import { PrismaService } from '../prisma/prisma.service';
import { toTask } from '../common/mappers';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const TASK_INCLUDE = {
  assignee: true,
  creator: true,
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(projectId: string): Promise<Task[]> {
    await this.requireProjectExists(projectId);
    const rows = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      include: TASK_INCLUDE,
    });
    return rows.map(toTask);
  }

  async create(
    currentUserId: string,
    projectId: string,
    dto: CreateTaskDto,
  ): Promise<Task> {
    await this.requireProjectMembership(currentUserId, projectId);

    const created = await this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        assigneeId: dto.assigneeId,
        creatorId: currentUserId,
        dueAt: dto.dueAt === null ? null : new Date(dto.dueAt),
      },
      include: TASK_INCLUDE,
    });
    return toTask(created);
  }

  async update(
    currentUserId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    await this.requireProjectMembership(currentUserId, projectId);
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (existing === null) {
      throw new NotFoundException(`Task ${taskId} not found in project ${projectId}`);
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title === undefined ? {} : { title: dto.title }),
        ...(dto.description === undefined ? {} : { description: dto.description }),
        ...(dto.status === undefined ? {} : { status: dto.status }),
        ...(dto.assigneeId === undefined ? {} : { assigneeId: dto.assigneeId }),
        ...(dto.dueAt === undefined
          ? {}
          : { dueAt: dto.dueAt === null ? null : new Date(dto.dueAt) }),
      },
      include: TASK_INCLUDE,
    });
    return toTask(updated);
  }

  async remove(currentUserId: string, projectId: string, taskId: string): Promise<void> {
    await this.requireProjectMembership(currentUserId, projectId);
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (existing === null) {
      throw new NotFoundException(`Task ${taskId} not found in project ${projectId}`);
    }
    await this.prisma.task.delete({ where: { id: taskId } });
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
        'You must be a project member (or higher) to modify its tasks',
      );
    }
  }
}
