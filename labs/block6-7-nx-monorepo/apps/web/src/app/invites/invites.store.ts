import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CreateInviteRequest, Invite } from '@aicas/shared-types';

import { ApiClient } from '../core/api.client';

@Injectable({ providedIn: 'root' })
export class InvitesStore {
  private readonly api = inject(ApiClient);

  private readonly currentProjectId = signal<string | null>(null);
  private readonly state = signal<readonly Invite[]>([]);
  private readonly loadingState = signal(false);

  readonly invites = computed(() => this.state());
  readonly loading = computed(() => this.loadingState());

  async loadFor(projectId: string): Promise<void> {
    this.currentProjectId.set(projectId);
    this.loadingState.set(true);
    try {
      const list = await firstValueFrom(
        this.api.get<Invite[]>(`/projects/${projectId}/invites`),
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

  async create(projectId: string, body: CreateInviteRequest): Promise<Invite> {
    const created = await firstValueFrom(
      this.api.post<Invite>(`/projects/${projectId}/invites`, body),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set([created, ...this.state()]);
    }
    return created;
  }

  async revoke(projectId: string, inviteId: string): Promise<Invite> {
    const updated = await firstValueFrom(
      this.api.delete<Invite>(`/projects/${projectId}/invites/${inviteId}`),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set(this.state().map((i) => (i.id === inviteId ? updated : i)));
    }
    return updated;
  }
}
