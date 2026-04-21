import { Component, OnChanges, SimpleChanges, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { InviteStatus, MemberRole } from '@aicas/shared-types';
import { MEMBER_ROLES } from '@aicas/shared-types';

import { asApiError, describeApiError } from '../core/api-error';
import { formatRelativeDate } from '../shared/utils/date';
import { InvitesStore } from './invites.store';

@Component({
  selector: 'app-invite-list',
  imports: [ReactiveFormsModule],
  template: `
    <section class="space-y-4">
      <ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        @for (invite of invites(); track invite.id) {
          <li class="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ invite.email }}</p>
              <p class="text-xs text-slate-500">
                Invited as <strong>{{ invite.role }}</strong> by {{ invite.invitedBy.name }}
                · {{ relative(invite.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                [class]="statusClasses(invite.status)"
              >
                {{ statusLabel(invite.status) }}
              </span>
              @if (invite.status === 'pending') {
                <button
                  type="button"
                  class="text-xs text-red-600 hover:underline"
                  (click)="onRevoke(invite.id)"
                >
                  Revoke
                </button>
              }
            </div>
          </li>
        }
        @if (invites().length === 0) {
          <li class="px-4 py-6 text-center text-xs text-slate-400">No invites yet.</li>
        }
      </ul>

      <form
        [formGroup]="addForm"
        (ngSubmit)="onCreate()"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-slate-700">Send an invite</h3>
        <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
          <input
            type="email"
            formControlName="email"
            placeholder="someone@example.com"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <select formControlName="role" class="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            @for (role of roles; track role) {
              <option [value]="role">{{ role }}</option>
            }
          </select>
          <button
            type="submit"
            [disabled]="addForm.invalid || submitting()"
            class="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {{ submitting() ? 'Sending…' : 'Send invite' }}
          </button>
        </div>
        @if (errorMessage(); as message) {
          <p class="mt-2 text-xs text-red-600">{{ message }}</p>
        }
      </form>
    </section>
  `,
})
export class InviteList implements OnChanges {
  private readonly store = inject(InvitesStore);

  readonly projectId = input.required<string>();

  protected readonly invites = this.store.invites;
  protected readonly roles = MEMBER_ROLES;
  protected readonly relative = formatRelativeDate;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly addForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    role: new FormControl<MemberRole>('member', { nonNullable: true }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      void this.store.loadFor(this.projectId());
    }
  }

  protected statusLabel(status: InviteStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected statusClasses(status: InviteStatus): string {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800';
      case 'declined':
        return 'bg-slate-100 text-slate-600';
      case 'revoked':
        return 'bg-red-100 text-red-700';
    }
  }

  protected async onRevoke(inviteId: string): Promise<void> {
    try {
      await this.store.revoke(this.projectId(), inviteId);
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    }
  }

  protected async onCreate(): Promise<void> {
    if (this.addForm.invalid) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const value = this.addForm.getRawValue();
    try {
      await this.store.create(this.projectId(), { email: value.email, role: value.role });
      this.addForm.reset({ email: '', role: 'member' });
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    } finally {
      this.submitting.set(false);
    }
  }
}
