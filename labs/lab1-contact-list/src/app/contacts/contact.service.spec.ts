import { TestBed } from '@angular/core/testing';

import { ContactService, STORAGE_KEY } from './contact.service';

describe('ContactService', () => {
  beforeEach(() => {
    // Pre-seed storage with an explicit empty list so the
    // first-load sample-contact seeding path doesn't fire in tests.
    // The seeding path is covered by its own test below.
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, '[]');
    TestBed.configureTestingModule({});
  });

  function makeService(): ContactService {
    return TestBed.inject(ContactService);
  }

  it('respects an explicit empty list in storage', () => {
    const service = makeService();
    expect(service.contacts()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('seeds sample contacts on a truly empty first load', () => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ContactService);
    expect(service.count()).toBeGreaterThan(0);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  describe('create', () => {
    it('creates a contact and assigns id + timestamps', () => {
      const service = makeService();
      const result = service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.id).toMatch(/[0-9a-f-]{36}/);
      expect(result.value.firstName).toBe('Ada');
      expect(result.value.createdAt).toBe(result.value.updatedAt);
      expect(service.contacts()).toHaveLength(1);
    });

    it('rejects empty firstName with a validation error', () => {
      const service = makeService();
      const result = service.create({
        firstName: '   ',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe('validation');
      if (result.error.kind !== 'validation') return;
      expect(result.error.field).toBe('firstName');
    });

    it('rejects an email without "@"', () => {
      const service = makeService();
      const result = service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'not-an-email',
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe('validation');
      if (result.error.kind !== 'validation') return;
      expect(result.error.field).toBe('email');
    });
  });

  describe('update', () => {
    it('updates fields and bumps updatedAt', async () => {
      const service = makeService();
      const created = service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      });
      if (!created.ok) throw new Error('create failed');

      await new Promise((r) => setTimeout(r, 5));

      const updated = service.update(created.value.id, {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@new.example.com',
      });

      expect(updated.ok).toBe(true);
      if (!updated.ok) return;
      expect(updated.value.email).toBe('ada@new.example.com');
      expect(updated.value.updatedAt).not.toBe(updated.value.createdAt);
    });

    it('returns not-found for an unknown id', () => {
      const service = makeService();
      const result = service.update('does-not-exist', {
        firstName: 'X',
        lastName: 'Y',
        email: 'x@y.com',
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe('not-found');
    });
  });

  describe('remove', () => {
    it('removes a contact', () => {
      const service = makeService();
      const created = service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      });
      if (!created.ok) throw new Error('create failed');

      const removed = service.remove(created.value.id);
      expect(removed.ok).toBe(true);
      expect(service.contacts()).toEqual([]);
    });

    it('returns not-found for an unknown id', () => {
      const service = makeService();
      const result = service.remove('does-not-exist');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe('not-found');
    });
  });

  it('persists to localStorage and reloads', () => {
    const service = makeService();
    service.create({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ContactService);

    expect(reloaded.contacts()).toHaveLength(1);
    expect(reloaded.contacts()[0].firstName).toBe('Ada');
  });
});
