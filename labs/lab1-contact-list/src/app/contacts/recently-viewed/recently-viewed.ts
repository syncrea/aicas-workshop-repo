import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatRelativeDate } from '../../shared/utils/date';
import { contactDisplayName } from '../contact.model';
import { RecentlyViewedService } from './recently-viewed.service';

@Component({
  selector: 'app-recently-viewed',
  imports: [RouterLink],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-slate-700">Recently viewed</h3>

      @if (service.entries().length) {
        <ul class="mt-3 space-y-2">
          @for (entry of service.entries(); track entry.contact.id) {
            <li>
              <a
                [routerLink]="['/contacts', entry.contact.id]"
                class="flex items-center justify-between text-sm hover:text-slate-900"
              >
                <span class="text-slate-700">{{ displayName(entry.contact) }}</span>
                <span class="text-xs text-slate-500">
                  viewed {{ relative(entry.viewedAt) }}
                </span>
              </a>
            </li>
          }
        </ul>
      } @else {
        <p class="mt-2 text-sm text-slate-500">No contacts viewed yet.</p>
      }
    </div>
  `,
})
export class RecentlyViewed {
  protected readonly service = inject(RecentlyViewedService);
  protected readonly displayName = contactDisplayName;
  protected readonly relative = formatRelativeDate;
}
