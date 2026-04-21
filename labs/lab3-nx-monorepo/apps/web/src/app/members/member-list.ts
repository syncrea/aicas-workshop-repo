import { Component, OnChanges, SimpleChanges, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { MemberRole } from '@aicas/shared-types';
import { MEMBER_ROLES } from '@aicas/shared-types';

import { Avatar } from '../shared/components/avatar';
import { RoleBadge } from '../shared/components/role-badge';
import { asApiError, describeApiError } from '../core/api-error';
import { formatRelativeDate } from '../shared/utils/date';
import { MembersStore } from './members.store';
import { UsersStore } from '../users/users.store';

@Component({
  selector: 'app-member-list',
  imports: [ReactiveFormsModule, Avatar, RoleBadge],
  template: `
    <section class="space-y-4">
      <ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        @for (member of members(); track member.id) {
          <li class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex items-center gap-3">
              <app-avatar [name]="member.user.name" />
              <div>
                <p class="text-sm font-medium text-slate-800">{{ member.user.name }}</p>
                <p class="text-xs text-slate-500">
                  Joined {{ relative(member.joinedAt) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <app-role-badge [role]="member.role" />
              <select
                class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs"
                [value]="member.role"
                (change)="onChangeRole(member.id, $event)"
              >
                @for (role of roles; track role) {
                  <option [value]="role">{{ roleLabel(role) }}</option>
                }
              </select>
              <button
                type="button"
                class="text-xs text-red-600 hover:underline"
                (click)="onRemove(member.id)"
              >
                Remove
              </button>
            </div>
          </li>
        }
        @if (members().length === 0) {
          <li class="px-4 py-6 text-center text-xs text-slate-400">No members yet.</li>
        }
      </ul>

      <form
        [formGroup]="addForm"
        (ngSubmit)="onAdd()"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-slate-700">Add a member</h3>
        <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
          <select formControlName="userId" class="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="" disabled>Choose a user…</option>
            @for (user of addableUsers(); track user.id) {
              <option [value]="user.id">{{ user.name }}</option>
            }
          </select>
          <select formControlName="role" class="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            @for (role of roles; track role) {
              <option [value]="role">{{ roleLabel(role) }}</option>
            }
          </select>
          <button
            type="submit"
            [disabled]="addForm.invalid || submitting()"
            class="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {{ submitting() ? 'Adding…' : 'Add member' }}
          </button>
        </div>
        @if (errorMessage(); as message) {
          <p class="mt-2 text-xs text-red-600">{{ message }}</p>
        }
      </form>
    </section>
  `,
})
export class MemberList implements OnChanges {
  private readonly store = inject(MembersStore);
  private readonly usersStore = inject(UsersStore);

  readonly projectId = input.required<string>();

  protected readonly members = this.store.members;
  protected readonly roles = MEMBER_ROLES;
  protected readonly relative = formatRelativeDate;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly addForm = new FormGroup({
    userId: new FormControl('', { nonNullable: true }),
    role: new FormControl<MemberRole>('member', { nonNullable: true }),
  });

  protected readonly addableUsers = computed(() => {
    const memberIds = new Set(this.members().map((m) => m.user.id));
    return this.usersStore.users().filter((user) => !memberIds.has(user.id));
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      void this.store.loadFor(this.projectId());
    }
  }

  protected roleLabel(role: MemberRole): string {
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

  protected async onChangeRole(memberId: string, event: Event): Promise<void> {
    const newRole = (event.target as HTMLSelectElement).value as MemberRole;
    try {
      await this.store.updateRole(this.projectId(), memberId, { role: newRole });
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    }
  }

  protected async onRemove(memberId: string): Promise<void> {
    try {
      await this.store.remove(this.projectId(), memberId);
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    }
  }

  protected async onAdd(): Promise<void> {
    const value = this.addForm.getRawValue();
    if (value.userId === '') {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      await this.store.add(this.projectId(), { userId: value.userId, role: value.role });
      this.addForm.reset({ userId: '', role: 'member' });
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    } finally {
      this.submitting.set(false);
    }
  }
}
