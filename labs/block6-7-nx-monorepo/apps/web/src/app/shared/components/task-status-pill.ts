import { Component, computed, input } from '@angular/core';
import type { TaskStatus } from '@aicas/shared-types';

@Component({
  selector: 'app-task-status-pill',
  template: `
    <span
      class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      [class]="classes()"
    >
      <span class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" [class]="dotClasses()"></span>
      {{ label() }}
    </span>
  `,
})
export class TaskStatusPill {
  readonly status = input.required<TaskStatus>();

  protected readonly label = computed(() => statusLabel(this.status()));
  protected readonly classes = computed(() => statusClasses(this.status()));
  protected readonly dotClasses = computed(() => dotClasses(this.status()));
}

function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return 'To do';
    case 'in_progress':
      return 'In progress';
    case 'done':
      return 'Done';
  }
}

function statusClasses(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return 'bg-slate-100 text-slate-700';
    case 'in_progress':
      return 'bg-amber-100 text-amber-800';
    case 'done':
      return 'bg-emerald-100 text-emerald-800';
  }
}

function dotClasses(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return 'bg-slate-400';
    case 'in_progress':
      return 'bg-amber-500';
    case 'done':
      return 'bg-emerald-500';
  }
}
