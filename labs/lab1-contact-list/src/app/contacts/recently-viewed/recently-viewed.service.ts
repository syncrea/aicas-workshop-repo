import { Injectable, computed, inject, signal } from '@angular/core';

import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';

export const STORAGE_KEY = 'recently-viewed.v1';
const MAX_ITEMS = 5;

/**
 * Storage shape for one recently-viewed entry. Holds only the contact
 * id (plus when it was viewed) so we don't duplicate the canonical
 * Contact record across stores — the live Contact is joined in at
 * read time via the `entries` computed.
 */
export interface RecentlyViewedRecord {
  readonly id: string;
  readonly viewedAt: string;
}

/**
 * Read-side shape: a Contact paired with its last-viewed timestamp.
 * Consumers should bind to `entries` and render directly; the service
 * already drops deleted contacts, dedupes, and caps at MAX_ITEMS.
 */
export interface RecentlyViewedEntry {
  readonly contact: Contact;
  readonly viewedAt: string;
}

/**
 * Tracks which contacts the user has looked at most recently. Mirrors
 * the `ContactService` shape — signal-backed state, localStorage
 * mirror, derived view via `computed` — so consumers can bind directly
 * without sorting or joining themselves.
 */
@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly contactService = inject(ContactService);
  private readonly state = signal<readonly RecentlyViewedRecord[]>(
    this.loadFromStorage(),
  );

  /**
   * Recently-viewed contacts joined with the live Contact record,
   * filtered to drop entries whose contact no longer exists.
   * Already newest-first by construction — don't re-sort.
   */
  readonly entries = computed<readonly RecentlyViewedEntry[]>(() => {
    const out: RecentlyViewedEntry[] = [];
    for (const record of this.state()) {
      const lookup = this.contactService.getById(record.id);
      if (lookup.ok) {
        out.push({ contact: lookup.value, viewedAt: record.viewedAt });
      }
    }
    return out;
  });

  /**
   * Record that the user just viewed `contactId`. Moves the id to the
   * front (deduping prior entries) and trims to MAX_ITEMS. Doesn't
   * validate the id — if the contact is later deleted, the `entries`
   * computed filters it out, so a stale id is harmless.
   */
  track(contactId: string): void {
    const viewedAt = new Date().toISOString();
    this.state.update((records) => {
      const withoutDuplicate = records.filter((r) => r.id !== contactId);
      return [{ id: contactId, viewedAt }, ...withoutDuplicate].slice(0, MAX_ITEMS);
    });
    this.persist();
  }

  private loadFromStorage(): readonly RecentlyViewedRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed as RecentlyViewedRecord[];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    } catch {
      // Storage quota or disabled — silent best-effort, the in-memory
      // state still works for the current session.
    }
  }
}
