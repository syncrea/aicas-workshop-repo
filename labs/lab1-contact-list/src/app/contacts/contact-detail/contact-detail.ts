import { Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { formatRelativeDate } from '../../shared/utils/date';
import { contactDisplayName } from '../contact.model';
import { ContactService } from '../contact.service';
import { RecentlyViewedService } from '../recently-viewed/recently-viewed.service';

@Component({
  selector: 'app-contact-detail',
  imports: [RouterLink],
  template: `
    @let result = contactResult();

    @if (!result.ok) {
      <div class="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <p class="font-medium text-amber-900">Contact not found</p>
        <p class="mt-1 text-sm text-amber-800">
          The contact you're looking for doesn't exist or was deleted.
        </p>
        <a
          routerLink="/contacts"
          class="mt-4 inline-block text-sm font-medium text-amber-900 underline"
        >
          Back to all contacts
        </a>
      </div>
    } @else {
      @let contact = result.value;
      <div class="space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight">
              {{ displayName(contact) }}
            </h2>
            @if (contact.company) {
              <p class="text-sm text-slate-500">{{ contact.company }}</p>
            }
          </div>
          <div class="flex items-center gap-2">
            <a
              [routerLink]="['/contacts', contact.id, 'edit']"
              class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </a>
            <button
              type="button"
              (click)="onDelete(contact.id)"
              class="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <dl
          class="grid grid-cols-1 gap-y-4 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2"
        >
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd class="mt-1 text-sm text-slate-900">
              <a class="hover:underline" [href]="'mailto:' + contact.email">
                {{ contact.email }}
              </a>
            </dd>
          </div>
          @if (contact.phone) {
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Phone
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ contact.phone }}</dd>
            </div>
          }
          @if (contact.notes) {
            <div class="sm:col-span-2">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Notes
              </dt>
              <dd class="mt-1 whitespace-pre-line text-sm text-slate-900">
                {{ contact.notes }}
              </dd>
            </div>
          }
        </dl>

        <p class="text-xs text-slate-500">
          Added {{ relative(contact.createdAt) }}
          @if (contact.updatedAt !== contact.createdAt) {
            · Updated {{ relative(contact.updatedAt) }}
          }
        </p>
      </div>
    }
  `,
})
export class ContactDetail {
  private readonly service = inject(ContactService);
  private readonly router = inject(Router);
  private readonly recentlyViewed = inject(RecentlyViewedService);

  readonly id = input.required<string>();

  protected readonly contactResult = computed(() => this.service.getById(this.id()));
  protected readonly displayName = contactDisplayName;
  protected readonly relative = formatRelativeDate;

  constructor() {
    effect(() => {
      const result = this.contactResult();
      if (result.ok) {
        this.recentlyViewed.track(result.value.id);
      }
    });
  }

  protected onDelete(id: string): void {
    if (!confirm('Delete this contact? This cannot be undone.')) {
      return;
    }
    const result = this.service.remove(id);
    if (result.ok) {
      void this.router.navigate(['/contacts']);
    }
  }
}
