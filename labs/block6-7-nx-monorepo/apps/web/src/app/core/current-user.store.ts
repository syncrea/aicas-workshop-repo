import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'aicas.currentUserId';

/**
 * Holds the id of the "currently logged-in" user. The workshop has no real
 * login flow — the user picker in the header sets this, and the
 * {@link ApiClient} attaches it as the `X-User-Id` header on every request.
 *
 * Persisted to localStorage so a page reload keeps you logged in as the
 * same demo user.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserStore {
  private readonly state = signal<string | null>(this.readInitial());

  readonly currentUserId = computed(() => this.state());
  readonly isSignedIn = computed(() => this.state() !== null);

  setCurrentUser(userId: string | null): void {
    this.state.set(userId);
    if (userId === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, userId);
    }
  }

  private readInitial(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
