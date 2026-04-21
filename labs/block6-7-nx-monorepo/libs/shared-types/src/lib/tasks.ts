import type { UserSummary } from './users';

/**
 * Allowed values for {@link Task.status}. SQLite + Prisma doesn't support
 * native enums, so the string union lives here and is enforced at the
 * validation layer.
 */
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly assignee: UserSummary | null;
  readonly creator: UserSummary;
  readonly dueAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Body accepted by `POST /api/projects/:projectId/tasks`. */
export interface CreateTaskRequest {
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly assigneeId: string | null;
  readonly dueAt: string | null;
}

/** Body accepted by `PATCH /api/projects/:projectId/tasks/:id`. */
export interface UpdateTaskRequest {
  readonly title?: string;
  readonly description?: string | null;
  readonly status?: TaskStatus;
  readonly assigneeId?: string | null;
  readonly dueAt?: string | null;
}
