import { describe, expect, it } from 'vitest';

import { TASK_STATUSES } from './tasks';
import { MEMBER_ROLES } from './members';
import { INVITE_STATUSES } from './invites';
import { API_ERROR_CODES } from './api-error';

/**
 * Smoke tests for the string-union constants. They guard against accidental
 * shape drift — adding or removing a value here is almost always a breaking
 * change and worth a deliberate review.
 */
describe('shared-types union constants', () => {
  it('exposes the task statuses in stable order', () => {
    expect([...TASK_STATUSES]).toEqual(['todo', 'in_progress', 'done']);
  });

  it('exposes the member roles in privilege order (highest first)', () => {
    expect([...MEMBER_ROLES]).toEqual(['owner', 'admin', 'member', 'viewer']);
  });

  it('exposes the invite statuses including all terminal transitions', () => {
    expect([...INVITE_STATUSES]).toEqual([
      'pending',
      'accepted',
      'declined',
      'revoked',
    ]);
  });

  it('exposes a closed set of API error codes', () => {
    expect([...API_ERROR_CODES]).toEqual([
      'unauthorized',
      'forbidden',
      'not_found',
      'validation_failed',
      'conflict',
      'internal_error',
    ]);
  });
});
