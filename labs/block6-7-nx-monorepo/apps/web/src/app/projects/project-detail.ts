import { Component, OnChanges, SimpleChanges, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Project } from '@aicas/shared-types';

import { Avatar } from '../shared/components/avatar';
import { TaskBoard } from '../tasks/task-board';
import { MemberList } from '../members/member-list';
import { InviteList } from '../invites/invite-list';
import { AttachmentList } from '../attachments/attachment-list';
import { asApiError, describeApiError } from '../core/api-error';
import { formatRelativeDate } from '../shared/utils/date';
import { ProjectsStore } from './projects.store';
import { UsersStore } from '../users/users.store';

type Tab = 'tasks' | 'members' | 'invites' | 'attachments';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Avatar, TaskBoard, MemberList, InviteList, AttachmentList],
  template: `
    <div class="space-y-6">
      @if (project(); as p) {
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <span
              class="mt-1 inline-block h-4 w-4 flex-none rounded-full"
              [style.background-color]="p.color"
            ></span>
            <div>
              <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ p.name }}</h1>
              @if (p.description) {
                <p class="mt-1 max-w-2xl text-sm text-slate-600">{{ p.description }}</p>
              }
              <p class="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <app-avatar [name]="p.owner.name" size="sm" />
                Owned by {{ p.owner.name }} · updated {{ relative(p.updatedAt) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a
              [routerLink]="['/projects', p.id, 'edit']"
              class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Edit
            </a>
            <button
              type="button"
              class="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
              (click)="onDelete(p)"
              [disabled]="deleting()"
            >
              {{ deleting() ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>

        <div class="border-b border-slate-200">
          <nav class="-mb-px flex gap-6 text-sm">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                class="border-b-2 px-1 pb-2 font-medium transition"
                [class.border-violet-600]="activeTab() === tab.id"
                [class.text-violet-700]="activeTab() === tab.id"
                [class.border-transparent]="activeTab() !== tab.id"
                [class.text-slate-500]="activeTab() !== tab.id"
                [class.hover:text-slate-700]="activeTab() !== tab.id"
                (click)="activeTab.set(tab.id)"
              >
                {{ tab.label }}
              </button>
            }
          </nav>
        </div>

        @switch (activeTab()) {
          @case ('tasks') {
            <app-task-board [projectId]="p.id" />
          }
          @case ('members') {
            <app-member-list [projectId]="p.id" />
          }
          @case ('invites') {
            <app-invite-list [projectId]="p.id" />
          }
          @case ('attachments') {
            <app-attachment-list [projectId]="p.id" />
          }
        }
      } @else if (loadError(); as message) {
        <div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {{ message }}
        </div>
        <a routerLink="/projects" class="text-sm text-violet-600 hover:underline">← Back to projects</a>
      } @else {
        <p class="text-sm text-slate-500">Loading project…</p>
      }
    </div>
  `,
})
export class ProjectDetail implements OnChanges {
  private readonly store = inject(ProjectsStore);
  private readonly usersStore = inject(UsersStore);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly project = signal<Project | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly deleting = signal(false);
  protected readonly activeTab = signal<Tab>('tasks');
  protected readonly relative = formatRelativeDate;

  protected readonly tabs: ReadonlyArray<{ id: Tab; label: string }> = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'members', label: 'Members' },
    { id: 'invites', label: 'Invites' },
    { id: 'attachments', label: 'Attachments' },
  ];

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes['id']) {
      return;
    }
    this.loadError.set(null);
    this.project.set(this.store.byId(this.id()));
    // Make sure the user picker / assignee dropdowns are populated.
    void this.usersStore.load();
    try {
      const fresh = await this.store.loadOne(this.id());
      this.project.set(fresh);
    } catch (error: unknown) {
      this.loadError.set(describeApiError(asApiError(error)));
    }
  }

  protected async onDelete(project: Project): Promise<void> {
    const confirmed = window.confirm(`Delete project "${project.name}"? This can't be undone.`);
    if (!confirmed) {
      return;
    }
    this.deleting.set(true);
    try {
      await this.store.remove(project.id);
      await this.router.navigate(['/projects']);
    } catch (error: unknown) {
      this.loadError.set(describeApiError(asApiError(error)));
    } finally {
      this.deleting.set(false);
    }
  }
}
