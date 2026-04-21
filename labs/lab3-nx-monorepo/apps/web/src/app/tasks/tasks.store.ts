import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from '@aicas/shared-types';

import { ApiClient } from '../core/api.client';

/**
 * Tracks tasks for a single project at a time. The detail page calls
 * `loadFor(projectId)` whenever the route's `:id` changes.
 */
@Injectable({ providedIn: 'root' })
export class TasksStore {
  private readonly api = inject(ApiClient);

  private readonly currentProjectId = signal<string | null>(null);
  private readonly state = signal<readonly Task[]>([]);
  private readonly loadingState = signal(false);

  readonly tasks = computed(() => this.state());
  readonly loading = computed(() => this.loadingState());

  readonly grouped = computed(() => {
    const items = this.state();
    return {
      todo: items.filter((t) => t.status === 'todo'),
      in_progress: items.filter((t) => t.status === 'in_progress'),
      done: items.filter((t) => t.status === 'done'),
    };
  });

  async loadFor(projectId: string): Promise<void> {
    this.currentProjectId.set(projectId);
    this.loadingState.set(true);
    try {
      const list = await firstValueFrom(
        this.api.get<Task[]>(`/projects/${projectId}/tasks`),
      );
      // Skip stale responses if the user navigated to a different project
      // mid-flight.
      if (this.currentProjectId() === projectId) {
        this.state.set(list);
      }
    } finally {
      if (this.currentProjectId() === projectId) {
        this.loadingState.set(false);
      }
    }
  }

  async create(projectId: string, body: CreateTaskRequest): Promise<Task> {
    const created = await firstValueFrom(
      this.api.post<Task>(`/projects/${projectId}/tasks`, body),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set([...this.state(), created]);
    }
    return created;
  }

  async update(projectId: string, taskId: string, body: UpdateTaskRequest): Promise<Task> {
    const updated = await firstValueFrom(
      this.api.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, body),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set(this.state().map((t) => (t.id === taskId ? updated : t)));
    }
    return updated;
  }

  async remove(projectId: string, taskId: string): Promise<void> {
    await firstValueFrom(this.api.delete<void>(`/projects/${projectId}/tasks/${taskId}`));
    if (this.currentProjectId() === projectId) {
      this.state.set(this.state().filter((t) => t.id !== taskId));
    }
  }
}
