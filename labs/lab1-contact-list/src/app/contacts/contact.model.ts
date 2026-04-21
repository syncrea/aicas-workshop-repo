/**
 * Persisted contact record.
 *
 * `createdAt` / `updatedAt` are stored as ISO strings (not `Date`) so
 * the whole record round-trips cleanly through JSON.stringify into
 * localStorage and back without bespoke (de)serialization. Components
 * that need a `Date` should call `new Date(contact.createdAt)`.
 */
export interface Contact {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly company: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Shape accepted when creating or updating a contact.
 *
 * The service is responsible for assigning `id`, `createdAt`, and
 * `updatedAt` on create, and bumping `updatedAt` on update. Callers
 * never construct those fields themselves.
 */
export interface ContactDraft {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly company?: string;
  readonly notes?: string;
}

/**
 * Discriminated union of every failure mode a contact operation can
 * surface to the caller. `ContactService` returns these inside a
 * `Result` instead of throwing.
 */
export type ContactError =
  | { readonly kind: 'not-found'; readonly id: string }
  | {
      readonly kind: 'validation';
      readonly field: 'firstName' | 'lastName' | 'email';
      readonly message: string;
    };

export function contactDisplayName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}
