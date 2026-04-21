import type { UserSummary } from './users';
import type { MemberRole } from './members';

export const INVITE_STATUSES = ['pending', 'accepted', 'declined', 'revoked'] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

export interface Invite {
  readonly id: string;
  readonly projectId: string;
  readonly email: string;
  readonly role: MemberRole;
  readonly status: InviteStatus;
  readonly invitedBy: UserSummary;
  readonly createdAt: string;
  readonly respondedAt: string | null;
}

/** Body accepted by `POST /api/projects/:projectId/invites`. */
export interface CreateInviteRequest {
  readonly email: string;
  readonly role: MemberRole;
}
