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
import type { Task } from '@aicas/shared-types';

import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Param('projectId') projectId: string): Promise<Task[]> {
    return this.tasks.listForProject(projectId);
  }

  @Post()
  create(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Body() body: CreateTaskDto,
  ): Promise<Task> {
    return this.tasks.create(current.id, projectId, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasks.update(current.id, projectId, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() current: { id: string },
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.tasks.remove(current.id, projectId, id);
  }
}
