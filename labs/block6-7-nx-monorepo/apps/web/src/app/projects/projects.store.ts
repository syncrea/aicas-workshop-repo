import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '@aicas/shared-types';

import { ApiClient } from '../core/api.client';

@Injectable({ providedIn: 'root' })
export class ProjectsStore {
  private readonly api = inject(ApiClient);

  private readonly listState = signal<readonly Project[]>([]);
  private readonly listLoading = signal(false);
  private readonly detailCache = signal<ReadonlyMap<string, Project>>(new Map());

  readonly projects = computed(() => this.listState());
  readonly loading = computed(() => this.listLoading());

  async loadAll(): Promise<void> {
    this.listLoading.set(true);
    try {
      const list = await firstValueFrom(this.api.get<Project[]>('/projects'));
      this.listState.set(list);
    } finally {
      this.listLoading.set(false);
    }
  }

  async loadOne(id: string): Promise<Project> {
    const project = await firstValueFrom(this.api.get<Project>(`/projects/${id}`));
    this.cacheProject(project);
    return project;
  }

  byId(id: string): Project | null {
    return this.detailCache().get(id) ?? this.listState().find((p) => p.id === id) ?? null;
  }

  async create(body: CreateProjectRequest): Promise<Project> {
    const created = await firstValueFrom(this.api.post<Project>('/projects', body));
    this.listState.set([created, ...this.listState()]);
    this.cacheProject(created);
    return created;
  }

  async update(id: string, body: UpdateProjectRequest): Promise<Project> {
    const updated = await firstValueFrom(this.api.patch<Project>(`/projects/${id}`, body));
    this.listState.set(
      this.listState().map((p) => (p.id === id ? updated : p)),
    );
    this.cacheProject(updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.delete<void>(`/projects/${id}`));
    this.listState.set(this.listState().filter((p) => p.id !== id));
    const next = new Map(this.detailCache());
    next.delete(id);
    this.detailCache.set(next);
  }

  private cacheProject(project: Project): void {
    const next = new Map(this.detailCache());
    next.set(project.id, project);
    this.detailCache.set(next);
  }
}
