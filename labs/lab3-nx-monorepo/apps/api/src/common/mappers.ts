/**
 * Pure functions that turn Prisma row shapes into the wire-format DTOs
 * declared in `libs/shared-types`. Centralised here so date serialization,
 * `null` handling and selected-field shaping live in one place.
 *
 * Any new domain entity should get its mapper added next to its peers below
 * — controllers and services should never inline `toISOString()` themselves.
 */

import type {
  Attachment as AttachmentRow,
  Invite as InviteRow,
  Member as MemberRow,
  Project as ProjectRow,
  Task as TaskRow,
  User as UserRow,
} from '@prisma/client';
import type {
  Attachment,
  Invite,
  InviteStatus,
  Member,
  MemberRole,
  Project,
  Task,
  TaskStatus,
  User,
  UserSummary,
} from '@aicas/shared-types';

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toUserSummary(row: Pick<UserRow, 'id' | 'email' | 'name' | 'avatarUrl'>): UserSummary {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
  };
}

export function toProject(
  row: ProjectRow & {
    owner: UserRow;
    _count: { members: number; tasks: number };
  },
): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    owner: toUserSummary(row.owner),
    memberCount: row._count.members,
    taskCount: row._count.tasks,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toTask(
  row: TaskRow & {
    assignee: UserRow | null;
    creator: UserRow;
  },
): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    assignee: row.assignee === null ? null : toUserSummary(row.assignee),
    creator: toUserSummary(row.creator),
    dueAt: row.dueAt === null ? null : row.dueAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toMember(
  row: MemberRow & { user: UserRow },
): Member {
  return {
    id: row.id,
    projectId: row.projectId,
    user: toUserSummary(row.user),
    role: row.role as MemberRole,
    joinedAt: row.joinedAt.toISOString(),
  };
}

export function toInvite(
  row: InviteRow & { invitedBy: UserRow },
): Invite {
  return {
    id: row.id,
    projectId: row.projectId,
    email: row.email,
    role: row.role as MemberRole,
    status: row.status as InviteStatus,
    invitedBy: toUserSummary(row.invitedBy),
    createdAt: row.createdAt.toISOString(),
    respondedAt: row.respondedAt === null ? null : row.respondedAt.toISOString(),
  };
}

export function toAttachment(
  row: AttachmentRow & { uploadedBy: UserRow },
): Attachment {
  return {
    id: row.id,
    projectId: row.projectId,
    fileName: row.fileName,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    uploadedBy: toUserSummary(row.uploadedBy),
    createdAt: row.createdAt.toISOString(),
  };
}
