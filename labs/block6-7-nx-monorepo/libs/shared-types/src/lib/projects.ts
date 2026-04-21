import type { UserSummary } from './users';

/**
 * Wire-format representation of a {@link Project} as returned by the list
 * endpoint (`GET /api/projects`). Members, tasks, invites and attachments
 * are loaded separately via dedicated endpoints to keep this payload small.
 */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly color: string;
  readonly owner: UserSummary;
  readonly memberCount: number;
  readonly taskCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Body accepted by `POST /api/projects`. */
export interface CreateProjectRequest {
  readonly name: string;
  readonly description: string | null;
  readonly color: string | null;
}

/** Body accepted by `PATCH /api/projects/:id`. All fields optional. */
export interface UpdateProjectRequest {
  readonly name?: string;
  readonly description?: string | null;
  readonly color?: string;
}
