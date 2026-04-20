import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { contactDisplayName } from '../contact.model';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contact-list',
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-baseline justify-between">
        <h2 class="text-2xl font-semibold tracking-tight">All contacts</h2>
        <p class="text-sm text-slate-500">
          {{ service.count() }} {{ service.count() === 1 ? 'contact' : 'contacts' }}
        </p>
      </div>

      @if (service.count() === 0) {
        <div
          class="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center"
        >
          <p class="text-slate-700 font-medium">No contacts yet</p>
          <p class="mt-1 text-sm text-slate-500">
            Add your first contact to get started.
          </p>
          <a
            routerLink="/contacts/new"
            class="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add contact
          </a>
        </div>
      } @else {
        <ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          @for (contact of service.contactsByName(); track contact.id) {
            <li>
              <a
                [routerLink]="['/contacts', contact.id]"
                class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
              >
                <div>
                  <p class="font-medium text-slate-900">{{ displayName(contact) }}</p>
                  <p class="text-sm text-slate-500">{{ contact.email }}</p>
                </div>
                @if (contact.company) {
                  <p class="text-sm text-slate-500">{{ contact.company }}</p>
                }
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ContactList {
  protected readonly service = inject(ContactService);
  protected readonly displayName = contactDisplayName;
}
