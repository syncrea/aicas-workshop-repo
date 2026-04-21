import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  AddMemberRequest,
  Member,
  UpdateMemberRequest,
} from '@aicas/shared-types';

import { ApiClient } from '../core/api.client';

@Injectable({ providedIn: 'root' })
export class MembersStore {
  private readonly api = inject(ApiClient);

  private readonly currentProjectId = signal<string | null>(null);
  private readonly state = signal<readonly Member[]>([]);
  private readonly loadingState = signal(false);

  readonly members = computed(() => this.state());
  readonly loading = computed(() => this.loadingState());

  async loadFor(projectId: string): Promise<void> {
    this.currentProjectId.set(projectId);
    this.loadingState.set(true);
    try {
      const list = await firstValueFrom(
        this.api.get<Member[]>(`/projects/${projectId}/members`),
      );
      if (this.currentProjectId() === projectId) {
        this.state.set(list);
      }
    } finally {
      if (this.currentProjectId() === projectId) {
        this.loadingState.set(false);
      }
    }
  }

  async add(projectId: string, body: AddMemberRequest): Promise<Member> {
    const created = await firstValueFrom(
      this.api.post<Member>(`/projects/${projectId}/members`, body),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set([...this.state(), created]);
    }
    return created;
  }

  async updateRole(
    projectId: string,
    memberId: string,
    body: UpdateMemberRequest,
  ): Promise<Member> {
    const updated = await firstValueFrom(
      this.api.patch<Member>(`/projects/${projectId}/members/${memberId}`, body),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set(this.state().map((m) => (m.id === memberId ? updated : m)));
    }
    return updated;
  }

  async remove(projectId: string, memberId: string): Promise<void> {
    await firstValueFrom(
      this.api.delete<void>(`/projects/${projectId}/members/${memberId}`),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set(this.state().filter((m) => m.id !== memberId));
    }
  }
}
