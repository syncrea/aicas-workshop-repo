import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatRelativeDate } from '../shared/utils/date';
import { Avatar } from '../shared/components/avatar';
import { ProjectsStore } from './projects.store';

@Component({
  selector: 'app-project-list',
  imports: [RouterLink, Avatar],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold tracking-tight text-slate-900">Projects</h1>
          <p class="text-sm text-slate-500">
            {{ projects().length }} project{{ projects().length === 1 ? '' : 's' }} in this workspace
          </p>
        </div>
        <a
          routerLink="/projects/new"
          class="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700"
        >
          + New project
        </a>
      </div>

      @if (loading() && projects().length === 0) {
        <p class="text-sm text-slate-500">Loading…</p>
      } @else if (projects().length === 0) {
        <div class="rounded-lg border border-dashed border-slate-300 p-10 text-center">
          <p class="text-sm text-slate-500">No projects yet — create the first one.</p>
        </div>
      } @else {
        <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (project of projects(); track project.id) {
            <li>
              <a
                [routerLink]="['/projects', project.id]"
                class="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-1 inline-block h-3 w-3 flex-none rounded-full"
                    [style.background-color]="project.color"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-slate-900">{{ project.name }}</p>
                    @if (project.description) {
                      <p class="mt-1 line-clamp-2 text-sm text-slate-500">
                        {{ project.description }}
                      </p>
                    }
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <div class="flex items-center gap-2">
                    <app-avatar [name]="project.owner.name" size="sm" />
                    <span>{{ project.owner.name }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span>{{ project.taskCount }} task{{ project.taskCount === 1 ? '' : 's' }}</span>
                    <span>{{ project.memberCount }} member{{ project.memberCount === 1 ? '' : 's' }}</span>
                  </div>
                </div>
                <p class="mt-2 text-xs text-slate-400">
                  Updated {{ relative(project.updatedAt) }}
                </p>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ProjectList implements OnInit {
  private readonly store = inject(ProjectsStore);

  protected readonly projects = this.store.projects;
  protected readonly loading = this.store.loading;
  protected readonly relative = formatRelativeDate;

  async ngOnInit(): Promise<void> {
    await this.store.loadAll();
  }
}
