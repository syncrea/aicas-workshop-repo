import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Avatar } from '../shared/components/avatar';
import { CurrentUserStore } from '../core/current-user.store';
import { UsersStore } from '../users/users.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Avatar],
  template: `
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div class="flex items-center gap-6">
          <a routerLink="/projects" class="text-base font-semibold tracking-tight text-slate-900">
            <span class="text-violet-600">⌗</span> Projects
          </a>
          <nav class="flex items-center gap-4 text-sm">
            <a
              routerLink="/projects"
              routerLinkActive="text-slate-900 font-medium"
              [routerLinkActiveOptions]="{ exact: false }"
              class="text-slate-600 hover:text-slate-900"
            >
              All projects
            </a>
            <a
              routerLink="/projects/new"
              routerLinkActive="text-slate-900 font-medium"
              class="text-slate-600 hover:text-slate-900"
            >
              New project
            </a>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <label for="user-picker" class="sr-only">Sign in as</label>
          <select
            id="user-picker"
            class="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            [value]="currentUserId() ?? ''"
            (change)="onPickUser($event)"
          >
            <option value="" disabled>Sign in as…</option>
            @for (user of users(); track user.id) {
              <option [value]="user.id">{{ user.name }}</option>
            }
          </select>
          @if (currentUser(); as me) {
            <app-avatar [name]="me.name" size="sm" />
          }
        </div>
      </div>
    </header>
  `,
})
export class Header {
  private readonly usersStore = inject(UsersStore);
  private readonly currentUserStore = inject(CurrentUserStore);

  protected readonly users = this.usersStore.users;
  protected readonly currentUserId = this.currentUserStore.currentUserId;
  protected readonly currentUser = computed(() => {
    const id = this.currentUserId();
    if (id === null) {
      return null;
    }
    return this.usersStore.byId(id);
  });

  constructor() {
    void this.usersStore.load();

    // Auto-select the first user the first time the user list lands and
    // nobody is signed in, so the demo "just works" instead of greeting
    // visitors with a 401 envelope from every protected request.
    effect(() => {
      const list = this.users();
      if (list.length > 0 && this.currentUserId() === null) {
        this.currentUserStore.setCurrentUser(list[0].id);
      }
    });
  }

  protected onPickUser(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.currentUserStore.setCurrentUser(value === '' ? null : value);
  }
}
