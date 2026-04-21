import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ContactService } from '../contact.service';
import { RecentlyViewedItem, RecentlyViewedService } from './recently-viewed.service';

@Component({
  selector: 'app-recently-viewed',
  standalone: false,
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-5">
      <h3 class="text-sm font-semibold text-slate-700">Recently viewed</h3>

      <ul *ngIf="(items$ | async)?.length; else empty" class="mt-3 space-y-2">
        <li *ngFor="let item of items$ | async">
          <a
            [routerLink]="['/contacts', item.contact_id]"
            class="flex items-center justify-between text-sm hover:text-slate-900"
          >
            <span class="text-slate-700">{{ getContactName(item.contact_id) }}</span>
            <span class="text-xs text-slate-500">
              viewed {{ formatRelativeTime(item.viewed_at) }}
            </span>
          </a>
        </li>
      </ul>

      <ng-template #empty>
        <p class="mt-2 text-sm text-slate-500">No contacts viewed yet.</p>
      </ng-template>
    </div>
  `,
})
export class RecentlyViewedComponent implements OnInit {
  items$!: Observable<RecentlyViewedItem[]>;

  constructor(
    private recentlyViewedService: RecentlyViewedService,
    private contactService: ContactService,
  ) {}

  ngOnInit(): void {
    this.items$ = this.recentlyViewedService.getRecentlyViewed().pipe(
      map((items) =>
        items
          .filter((i) => this.contactService.getById(i.contact_id).ok)
          .sort((a, b) => b.viewed_at - a.viewed_at)
          .slice(0, 5),
      ),
    );
  }

  getContactName(id: string): string {
    const result = this.contactService.getById(id);
    if (result.ok) {
      return result.value.firstName + ' ' + result.value.lastName;
    }
    return 'Unknown';
  }

  formatRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return 'just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes + ' minutes ago';
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours + ' hours ago';
    }
    const days = Math.floor(hours / 24);
    return days + ' days ago';
  }
}
