# NestJS Conventions (`apps/api`)

> **Audience:** anyone touching `apps/api/src/`. The TypeScript-level conventions in [`TYPESCRIPT.md`](./TYPESCRIPT.md) apply on top of these. Architecture-level concerns (request lifecycle, where authorization lives, the canonical `ApiError` shape) are in [`ARCHITECTURE.md`](../ARCHITECTURE.md) — this file covers the day-to-day patterns.

The backend is **NestJS 11, modular, Prisma-backed.** It serves a single REST API under the `/api` global prefix and returns JSON only.

---

## One module per domain entity

Each top-level entity gets a folder under `apps/api/src/<entity>/` containing:

```
projects/
├── projects.module.ts
├── projects.controller.ts
├── projects.service.ts
└── dto/
    ├── create-project.dto.ts
    └── update-project.dto.ts
```

Module boundaries match URL boundaries:

- `users` → `/api/users`
- `projects` → `/api/projects`
- `tasks` → `/api/projects/:projectId/tasks` (nested — see below)
- `members` → `/api/projects/:projectId/members`
- `invites` → `/api/projects/:projectId/invites`
- `attachments` → `/api/projects/:projectId/attachments`

Nested resources live in their own module, not inside `ProjectsModule`. The reason is purely organisational — keeping `projects.service.ts` focused on the project entity itself.

## Controllers are thin

A controller method's job is:

1. Pull the current user (`@CurrentUser() user`).
2. Receive validated DTO from the request body / params / query.
3. Call exactly one service method.
4. Return the service's result.

If a controller method has business logic, that logic belongs in the service.

```ts
@Patch(':id')
update(
  @CurrentUser() user: { id: string },
  @Param('id') id: string,
  @Body() dto: UpdateProjectDto,
): Promise<Project> {
  return this.service.update(user.id, id, dto);
}
```

## Services hold the logic — and the authorization

- One service per module. Inject `PrismaService` (it's globally provided).
- Any method that mutates state checks permissions itself — typically via a private `requireOwnerOrAdmin(currentUserId, projectId)` helper that throws `ForbiddenException`. The pattern is in `projects.service.ts`; copy it.
- Reads (`list`, `getById`) are public to authenticated and unauthenticated callers alike. If a future endpoint needs read-side authorization, do it the same way as writes — service-level check, not a guard.
- Return wire-format DTOs from service methods, not raw Prisma rows. Use the helpers in `apps/api/src/common/mappers.ts` (`toProject`, `toUser`, `toTask`, ...).

## Errors

- Throw the matching Nest exception:

  | Situation | Throw |
  | --- | --- |
  | Resource doesn't exist | `NotFoundException('Project x not found')` |
  | Caller is authenticated but not allowed | `ForbiddenException('Only owners can ...')` |
  | Caller is not authenticated and the route requires it | `UnauthorizedException(...)` |
  | Validated DTO got through but the data still violates an invariant | `BadRequestException(...)` |
  | Conflict (unique constraint, illegal state transition) | `ConflictException(...)` |

- The global `ApiExceptionFilter` (`apps/api/src/common/api-exception.filter.ts`) translates anything you throw into the canonical `ApiError` JSON. Don't try-catch in services to "wrap" an error in a friendlier shape — let the filter do it.

## DTOs

- One DTO class per request body shape. Files live under `<entity>/dto/`, named `create-*.dto.ts`, `update-*.dto.ts`, etc.
- DTOs are **classes**, not interfaces — they carry decorators and class-validator needs runtime metadata.
- Implement the corresponding `*Request` interface from `@aicas/shared-types` so the wire format stays in sync between client and server:

  ```ts
  import type { CreateProjectRequest } from '@aicas/shared-types';

  export class CreateProjectDto implements CreateProjectRequest {
    name!: string;
    description!: string | null;
    color!: string | null;
  }
  ```

- Add the validation decorators that match the field's wire-format type (`@IsString()`, `@IsOptional()`, `@MaxLength()`, `@IsIn(TASK_STATUSES)`, etc.). Look at `apps/api/src/projects/dto/create-project.dto.ts` for the full shape — it's the reference.

## Prisma usage

- `PrismaService` is provided globally by `PrismaModule`. Inject it, don't `new PrismaClient()`.
- Don't import `@prisma/client` types into `libs/shared-types` — keep the wire-format library Prisma-free. Map at the service boundary.
- `apps/api/prisma/schema.prisma` is the source of truth for the schema. If you change it, run `npx prisma migrate dev --name <descriptive_name>` from the lab root, then `npm run db:seed` to reset the database.
- Prefer `findUnique` over `findFirst` when the lookup is by primary key. Use `select` to limit columns when you only need a few — it's a micro-optimisation, but it also documents intent.

## Routing

- The global `/api` prefix is set in `main.ts`. Don't repeat `api/` inside `@Controller(...)`.
- Use `@Controller('projects')` (resource name only). Sub-routes go inside the controller via `@Get(':id')`, `@Post()`, etc.
- Nested resources accept the parent id as a `@Param`:

  ```ts
  @Controller('projects/:projectId/tasks')
  export class TasksController {
    @Get()
    list(@Param('projectId') projectId: string): Promise<Task[]> {
      return this.service.listFor(projectId);
    }
  }
  ```

## Tests

- **Jest** via Nx. `npx nx test api` runs the suite.
- Service-level tests use the real `PrismaService` against a temporary SQLite file when feasible, otherwise a hand-rolled stub. The current suite is sparse — that's fine for the workshop, but new substantial logic should ship with at least one test that exercises the authorization path.

## What to do when this file doesn't cover your case

1. Read the closest existing service and controller — the patterns are short and consistent.
2. If you need a new cross-cutting concern (caching, rate limiting, auditing, ...), don't reach for a Nest interceptor or guard without first asking whether the workshop scope justifies it. Most things that look like "we should add a guard" are better as a private service method here.
