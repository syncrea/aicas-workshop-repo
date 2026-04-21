/**
 * Wire-format representation of a {@link User} as returned by the API.
 *
 * Date fields are ISO-8601 strings, not `Date` objects, because that is the
 * shape that crosses the JSON boundary. The backend uses Prisma's generated
 * types internally; the frontend uses *this* type. Do not import Prisma
 * types into the frontend.
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Subset of {@link User} used in list views and inside other entities (e.g.
 * `Task.assignee`). Drops audit timestamps to keep payloads small.
 */
export interface UserSummary {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}
