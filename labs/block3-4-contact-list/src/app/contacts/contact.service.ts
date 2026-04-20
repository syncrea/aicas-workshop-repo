import { Injectable, computed, signal } from '@angular/core';

import { Result, err, ok } from '../shared/utils/result';
import { Contact, ContactDraft, ContactError } from './contact.model';

const STORAGE_KEY = 'contacts.v1';

/**
 * In-browser contact store. Holds the canonical list in a signal so
 * components can subscribe via `computed` / template binding, and
 * mirrors every mutation to `localStorage` so contacts survive a page
 * reload.
 *
 * All mutation methods return `Result<T, ContactError>` rather than
 * throwing. This is the project's canonical error-handling pattern —
 * see src/app/shared/utils/result.ts.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly state = signal<readonly Contact[]>(this.loadFromStorage());

  readonly contacts = this.state.asReadonly();
  readonly count = computed(() => this.state().length);

  /**
   * Contacts sorted alphabetically by last name, then first name.
   * Components that want the canonical display order should bind to
   * this signal directly instead of re-sorting in the template or
   * component class.
   */
  readonly contactsByName = computed(() =>
    [...this.state()].sort(
      (a, b) =>
        a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName),
    ),
  );

  getById(id: string): Result<Contact, ContactError> {
    const found = this.state().find((c) => c.id === id);
    if (!found) {
      return err({ kind: 'not-found', id });
    }
    return ok(found);
  }

  create(draft: ContactDraft): Result<Contact, ContactError> {
    const validation = this.validate(draft);
    if (!validation.ok) {
      return validation;
    }

    const now = new Date().toISOString();
    const contact: Contact = {
      id: crypto.randomUUID(),
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      phone: draft.phone?.trim() || null,
      company: draft.company?.trim() || null,
      notes: draft.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    this.state.update((list) => [...list, contact]);
    this.persist();
    return ok(contact);
  }

  update(id: string, draft: ContactDraft): Result<Contact, ContactError> {
    const existing = this.state().find((c) => c.id === id);
    if (!existing) {
      return err({ kind: 'not-found', id });
    }

    const validation = this.validate(draft);
    if (!validation.ok) {
      return validation;
    }

    const updated: Contact = {
      ...existing,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      phone: draft.phone?.trim() || null,
      company: draft.company?.trim() || null,
      notes: draft.notes?.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    this.state.update((list) => list.map((c) => (c.id === id ? updated : c)));
    this.persist();
    return ok(updated);
  }

  remove(id: string): Result<void, ContactError> {
    const existing = this.state().find((c) => c.id === id);
    if (!existing) {
      return err({ kind: 'not-found', id });
    }

    this.state.update((list) => list.filter((c) => c.id !== id));
    this.persist();
    return ok(undefined);
  }

  private validate(draft: ContactDraft): Result<ContactDraft, ContactError> {
    if (!draft.firstName?.trim()) {
      return err({
        kind: 'validation',
        field: 'firstName',
        message: 'First name is required',
      });
    }
    if (!draft.lastName?.trim()) {
      return err({
        kind: 'validation',
        field: 'lastName',
        message: 'Last name is required',
      });
    }
    const email = draft.email?.trim() ?? '';
    if (!email) {
      return err({ kind: 'validation', field: 'email', message: 'Email is required' });
    }
    if (!email.includes('@')) {
      return err({
        kind: 'validation',
        field: 'email',
        message: 'Email must contain "@"',
      });
    }
    return ok(draft);
  }

  private loadFromStorage(): readonly Contact[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed as Contact[];
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
