import { Component, computed, input } from '@angular/core';
import type { MemberRole } from '@aicas/shared-types';

@Component({
  selector: 'app-role-badge',
  template: `
    <span
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      [class]="classes()"
    >
      {{ label() }}
    </span>
  `,
})
export class RoleBadge {
  readonly role = input.required<MemberRole>();

  protected readonly label = computed(() => roleLabel(this.role()));
  protected readonly classes = computed(() => roleClasses(this.role()));
}

function roleLabel(role: MemberRole): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
  }
}

function roleClasses(role: MemberRole): string {
  switch (role) {
    case 'owner':
      return 'bg-violet-100 text-violet-800';
    case 'admin':
      return 'bg-sky-100 text-sky-800';
    case 'member':
      return 'bg-slate-100 text-slate-700';
    case 'viewer':
      return 'bg-slate-50 text-slate-500';
  }
}
