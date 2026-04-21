import type { UserSummary } from './users';

export const MEMBER_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export interface Member {
  readonly id: string;
  readonly projectId: string;
  readonly user: UserSummary;
  readonly role: MemberRole;
  readonly joinedAt: string;
}

/** Body accepted by `POST /api/projects/:projectId/members`. */
export interface AddMemberRequest {
  readonly userId: string;
  readonly role: MemberRole;
}

/** Body accepted by `PATCH /api/projects/:projectId/members/:id`. */
export interface UpdateMemberRequest {
  readonly role: MemberRole;
}
