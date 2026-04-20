import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-full flex flex-col">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto max-w-5xl px-6 py-4">
          <h1 class="text-lg font-semibold tracking-tight text-slate-900">Contacts</h1>
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
