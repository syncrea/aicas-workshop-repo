import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ContactService } from '../contact.service';

export interface RecentlyViewedItem {
  contact_id: string;
  viewed_at: number;
}

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private recentlyViewed$ = new BehaviorSubject<RecentlyViewedItem[]>([]);

  constructor(private contactService: ContactService) {}

  track(contactId: string): void {
    const lookup = this.contactService.getById(contactId);
    if (!lookup.ok) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const current = this.recentlyViewed$.value;
    const withoutDuplicate = current.filter((item) => item.contact_id !== contactId);
    const next = [
      { contact_id: contactId, viewed_at: Date.now() },
      ...withoutDuplicate,
    ];

    const sorted = next.sort((a, b) => b.viewed_at - a.viewed_at).slice(0, 5);
    this.recentlyViewed$.next(sorted);
  }

  getRecentlyViewed(): Observable<RecentlyViewedItem[]> {
    return this.recentlyViewed$.asObservable();
  }
}
