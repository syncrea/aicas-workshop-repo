import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { UserSummary } from '@aicas/shared-types';

import { ApiClient } from '../core/api.client';
import { asApiError } from '../core/api-error';

/**
 * Signal-based store for the list of demo users. Loaded once on first
 * access; the workshop has no user-creation flow so the list is static.
 */
@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly api = inject(ApiClient);

  private readonly state = signal<readonly UserSummary[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private loadPromise: Promise<void> | null = null;

  readonly users = computed(() => this.state());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  /**
   * Lazy load. Idempotent: subsequent calls return the same in-flight
   * promise rather than firing the request again.
   */
  load(): Promise<void> {
    if (this.loadPromise !== null) {
      return this.loadPromise;
    }
    this.loadingState.set(true);
    this.errorState.set(null);
    this.loadPromise = firstValueFrom(this.api.get<UserSummary[]>('/users'))
      .then((users) => {
        this.state.set(users);
      })
      .catch((error: unknown) => {
        this.errorState.set(asApiError(error).message);
        this.loadPromise = null;
      })
      .finally(() => {
        this.loadingState.set(false);
      });
    return this.loadPromise;
  }

  byId(id: string): UserSummary | null {
    return this.state().find((user) => user.id === id) ?? null;
  }
}
