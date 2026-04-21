import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './layout/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-header />
      <main class="flex-1">
        <div class="mx-auto max-w-6xl px-6 py-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class App {}
