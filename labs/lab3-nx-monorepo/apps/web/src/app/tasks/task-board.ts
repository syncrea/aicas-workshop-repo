import { Component, OnChanges, SimpleChanges, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateTaskRequest, Task, TaskStatus } from '@aicas/shared-types';
import { TASK_STATUSES } from '@aicas/shared-types';

import { Avatar } from '../shared/components/avatar';
import { TaskStatusPill } from '../shared/components/task-status-pill';
import { asApiError, describeApiError } from '../core/api-error';
import { formatRelativeDate } from '../shared/utils/date';
import { TasksStore } from './tasks.store';
import { UsersStore } from '../users/users.store';

@Component({
  selector: 'app-task-board',
  imports: [ReactiveFormsModule, Avatar, TaskStatusPill],
  template: `
    <section class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        @for (status of statuses; track status) {
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="mb-2 flex items-center justify-between">
              <app-task-status-pill [status]="status" />
              <span class="text-xs text-slate-500">{{ countFor(status) }}</span>
            </div>
            <ul class="space-y-2">
              @for (task of grouped()[status]; track task.id) {
                <li class="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <p class="text-sm font-medium text-slate-800">{{ task.title }}</p>
                  @if (task.description) {
                    <p class="mt-1 text-xs text-slate-500">{{ task.description }}</p>
                  }
                  <div class="mt-2 flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-xs text-slate-500">
                      @if (task.assignee; as assignee) {
                        <app-avatar [name]="assignee.name" size="sm" />
                        <span>{{ assignee.name }}</span>
                      } @else {
                        <span class="italic">Unassigned</span>
                      }
                    </div>
                    <select
                      class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-700"
                      [value]="task.status"
                      (change)="onChangeStatus(task, $event)"
                    >
                      @for (option of statuses; track option) {
                        <option [value]="option">{{ statusLabel(option) }}</option>
                      }
                    </select>
                  </div>
                </li>
              }
              @if (grouped()[status].length === 0) {
                <li class="rounded-md border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
                  No tasks
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <form
        [formGroup]="addForm"
        (ngSubmit)="onAdd()"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-slate-700">Add a task</h3>
        <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto]">
          <input
            type="text"
            formControlName="title"
            placeholder="Task title"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <select
            formControlName="status"
            class="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            @for (option of statuses; track option) {
              <option [value]="option">{{ statusLabel(option) }}</option>
            }
          </select>
          <select
            formControlName="assigneeId"
            class="rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="">Unassigned</option>
            @for (user of users(); track user.id) {
              <option [value]="user.id">{{ user.name }}</option>
            }
          </select>
          <button
            type="submit"
            [disabled]="addForm.invalid || submitting()"
            class="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {{ submitting() ? 'Adding…' : 'Add' }}
          </button>
        </div>
        @if (errorMessage(); as message) {
          <p class="mt-2 text-xs text-red-600">{{ message }}</p>
        }
      </form>

      @if (loading()) {
        <p class="text-xs text-slate-500">Loading tasks…</p>
      } @else if (tasks().length > 0) {
        <p class="text-xs text-slate-400">Last task updated {{ relative(latestUpdate()) }}.</p>
      }
    </section>
  `,
})
export class TaskBoard implements OnChanges {
  private readonly store = inject(TasksStore);
  private readonly usersStore = inject(UsersStore);

  readonly projectId = input.required<string>();

  protected readonly tasks = this.store.tasks;
  protected readonly grouped = this.store.grouped;
  protected readonly loading = this.store.loading;
  protected readonly users = this.usersStore.users;
  protected readonly relative = formatRelativeDate;
  protected readonly statuses = TASK_STATUSES;

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly addForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<TaskStatus>('todo', { nonNullable: true }),
    assigneeId: new FormControl<string>('', { nonNullable: true }),
  });

  protected readonly latestUpdate = computed(() => {
    const items = this.tasks();
    if (items.length === 0) {
      return new Date(0).toISOString();
    }
    return items.reduce((latest, t) => (t.updatedAt > latest ? t.updatedAt : latest), items[0].updatedAt);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      void this.store.loadFor(this.projectId());
    }
  }

  protected countFor(status: TaskStatus): number {
    return this.grouped()[status].length;
  }

  protected statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'todo':
        return 'To do';
      case 'in_progress':
        return 'In progress';
      case 'done':
        return 'Done';
    }
  }

  protected async onChangeStatus(task: Task, event: Event): Promise<void> {
    const newStatus = (event.target as HTMLSelectElement).value as TaskStatus;
    if (newStatus === task.status) {
      return;
    }
    try {
      await this.store.update(this.projectId(), task.id, { status: newStatus });
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    }
  }

  protected async onAdd(): Promise<void> {
    if (this.addForm.invalid) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const value = this.addForm.getRawValue();
    const body: CreateTaskRequest = {
      title: value.title,
      description: null,
      status: value.status,
      assigneeId: value.assigneeId === '' ? null : value.assigneeId,
      dueAt: null,
    };
    try {
      await this.store.create(this.projectId(), body);
      this.addForm.reset({ title: '', status: 'todo', assigneeId: '' });
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    } finally {
      this.submitting.set(false);
    }
  }
}
