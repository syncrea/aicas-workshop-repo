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
import type { Project } from '@aicas/shared-types';

import { CurrentUser } from '../auth/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(): Promise<Project[]> {
    return this.projects.list();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Project> {
    return this.projects.getById(id);
  }

  @Post()
  create(
    @CurrentUser() current: { id: string },
    @Body() body: CreateProjectDto,
  ): Promise<Project> {
    return this.projects.create(current.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() current: { id: string },
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
  ): Promise<Project> {
    return this.projects.update(current.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() current: { id: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.projects.remove(current.id, id);
  }
}
