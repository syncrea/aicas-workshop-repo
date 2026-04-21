import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-full flex flex-col">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-lg font-semibold tracking-tight text-slate-900">
            Contacts
          </a>
          <nav class="flex items-center gap-4 text-sm">
            <a
              routerLink="/contacts"
              routerLinkActive="text-slate-900 font-medium"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-600 hover:text-slate-900"
            >
              All contacts
            </a>
            <a
              routerLink="/contacts/new"
              class="rounded-md bg-slate-900 px-3 py-1.5 text-white text-sm font-medium hover:bg-slate-800"
            >
              Add contact
            </a>
          </nav>
        </div>
      </header>

      <main class="flex-1">
        <div class="mx-auto max-w-5xl px-6 py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class App {}
