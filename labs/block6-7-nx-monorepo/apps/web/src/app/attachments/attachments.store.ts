import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Attachment, CreateAttachmentRequest } from '@aicas/shared-types';

import { ApiClient } from '../core/api.client';

@Injectable({ providedIn: 'root' })
export class AttachmentsStore {
  private readonly api = inject(ApiClient);

  private readonly currentProjectId = signal<string | null>(null);
  private readonly state = signal<readonly Attachment[]>([]);
  private readonly loadingState = signal(false);

  readonly attachments = computed(() => this.state());
  readonly loading = computed(() => this.loadingState());

  async loadFor(projectId: string): Promise<void> {
    this.currentProjectId.set(projectId);
    this.loadingState.set(true);
    try {
      const list = await firstValueFrom(
        this.api.get<Attachment[]>(`/projects/${projectId}/attachments`),
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

  async create(projectId: string, body: CreateAttachmentRequest): Promise<Attachment> {
    const created = await firstValueFrom(
      this.api.post<Attachment>(`/projects/${projectId}/attachments`, body),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set([created, ...this.state()]);
    }
    return created;
  }

  async remove(projectId: string, attachmentId: string): Promise<void> {
    await firstValueFrom(
      this.api.delete<void>(`/projects/${projectId}/attachments/${attachmentId}`),
    );
    if (this.currentProjectId() === projectId) {
      this.state.set(this.state().filter((a) => a.id !== attachmentId));
    }
  }
}
