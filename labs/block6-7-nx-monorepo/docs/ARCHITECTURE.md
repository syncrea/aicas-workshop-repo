# Architecture

> **Audience:** anyone (human or agent) about to make a change that crosses module or app boundaries. If your change lives entirely inside one feature folder, you can probably skip this and go straight to the relevant `docs/guidelines/*.md`.

---

## The 30-second mental model

Two apps, one shared types library, one SQLite database.

```
┌──────────────────────┐    HTTP /api/*    ┌──────────────────────┐
│   apps/web           │  ───────────────▶ │   apps/api           │
│   Angular 21 SPA     │                   │   NestJS 11          │
│   port 4200          │  ◀─────────────── │   port 3000          │
└──────────┬───────────┘    JSON DTOs      └──────────┬───────────┘
           │                                          │
           │           libs/shared-types              │
           │  ┌─────────────────────────────────┐    │
           └─▶│  TypeScript interfaces +        │◀───┘
              │  string-union constants only.   │
              │  Wire-format contract.          │
              └─────────────────────────────────┘
                                                      │
                                                      ▼
                                          ┌──────────────────────┐
                                          │  apps/api/prisma/    │
                                          │  dev.db (SQLite)     │
                                          └──────────────────────┘
```

- **Frontend** never imports from the backend, and vice versa. The only shared code is `libs/shared-types`.
- **Auth is fake.** The frontend sends `X-User-Id: <id>` on every request; the backend resolves the user from that header. There is no token, no session, no login flow — it's a workshop, not a security demo.
- **The database is local SQLite.** Wiped and reseeded by `npm run db:reset`. There is no migration story between environments because there's only one environment.

---

## Domain model

Six entities, all defined in `apps/api/prisma/schema.prisma`. Read the schema directly — it is the source of truth — but here is the shape:

```
User                    Member (join table)              Project
  ─ id                    ─ projectId  ──────────────▶     ─ id
  ─ email                 ─ userId  ─────▶ User            ─ name
  ─ name                  ─ role: owner | admin | member   ─ description
  ─ avatarUrl                                              ─ color
                                                           ─ ownerId  ─▶ User
                                                           ─ createdAt
                                                           ─ updatedAt
                                                                │
                                                                ├─▶ Member[]    (memberships)
                                                                ├─▶ Task[]      (work items)
                                                                ├─▶ Invite[]    (pending join links)
                                                                └─▶ Attachment[] (file metadata)
```

Per project:

- **Tasks** — `title`, `description`, `status` (`todo` | `in_progress` | `done`), optional `assigneeId`, optional `dueDate`. Status is the kanban column on the frontend.
- **Members** — explicit join table because role is per-project. The owner is *also* a member with role `owner` (the seed and `ProjectsService.create` enforce this so authorization checks only need to read the `Member` table).
- **Invites** — `email`, `role`, `status` (`pending` | `accepted` | `revoked`). Workflow is hand-waved: there's no email sending, the model just lets you exercise the lifecycle.
- **Attachments** — file *metadata* only (`filename`, `contentType`, `size`, `url`). Workshop scope explicitly excludes blob storage; the `url` is whatever string the caller supplies.

String unions (`'todo' | 'in_progress' | 'done'`, role values, invite statuses) are **duplicated** between Prisma's schema (where they're stored as `String`) and `libs/shared-types/src/lib/*` (where they're typed). Keep them in sync by hand. There's a small Vitest spec in `libs/shared-types/src/lib/unions.spec.ts` that pins the exact set of values; if you change one, run `npm test` and you'll be reminded to update both.

---

## Backend architecture

```
apps/api/src/
├── main.ts                 # bootstrap: prefix /api, ValidationPipe, ApiExceptionFilter, CORS
├── app/app.module.ts       # imports every feature module + AuthModule + PrismaModule
├── prisma/
│   ├── prisma.service.ts   # extends PrismaClient
│   └── prisma.module.ts    # @Global() — every module gets PrismaService for free
├── auth/
│   ├── current-user.middleware.ts   # reads X-User-Id, attaches req.currentUser
│   ├── current-user.decorator.ts    # @CurrentUser() / @OptionalCurrentUser()
│   └── auth.module.ts               # applies the middleware to every route
├── common/
│   ├── api-exception.filter.ts      # converts any thrown exception into the canonical ApiError JSON
│   └── mappers.ts                   # toUser, toProject, toTask, ... — Prisma row → wire DTO
└── <feature>/                       # users, projects, tasks, members, invites, attachments
    ├── <feature>.controller.ts      # routes only. Pulls @CurrentUser(). Calls the service.
    ├── <feature>.service.ts         # business logic + authorization + Prisma calls.
    ├── <feature>.module.ts          # tiny — declares controllers + providers
    └── dto/                         # class-validator request shapes
```

**Request lifecycle** (e.g. `PATCH /api/projects/:id`):

1. Express receives the request.
2. `CurrentUserMiddleware` reads `X-User-Id`, looks up the user, attaches `req.currentUser`. Throws `401` if the header points to a non-existent user. Missing header is allowed; the route decides whether that's OK.
3. Nest's global `ValidationPipe` validates the request body against the controller's DTO class (`UpdateProjectDto`). Unknown fields are rejected (`forbidNonWhitelisted: true`).
4. The controller method receives a typed DTO and the current user. It hands both to the service.
5. The service performs authorization (e.g. `requireOwnerOrAdmin`), runs the Prisma query, runs the result through `mappers.toProject`, returns a wire-format DTO.
6. If anything throws, `ApiExceptionFilter` converts it into the canonical JSON shape:

   ```json
   {
     "statusCode": 404,
     "message": "Project prj_x not found",
     "code": "not_found",
     "details": null
   }
   ```

The same shape is described by `ApiError` in `libs/shared-types/src/lib/api-error.ts` — frontend and backend share the type.

**Authorization pattern.** There are no guards. Each service method that mutates state checks permissions itself, typically via a private `requireOwnerOrAdmin(currentUserId, projectId)` helper that throws `ForbiddenException` if the rule is violated. Reads are public (any user, even unidentified callers). When you add a new write endpoint, follow this pattern — *the controller layer is for routing, the service layer is where authorization happens.*

---

## Frontend architecture

```
apps/web/src/app/
├── app.ts                  # root shell: <app-header /> + <router-outlet />
├── app.config.ts           # provideZonelessChangeDetection, provideRouter, provideHttpClient
├── app.routes.ts           # lazy-loaded routes
├── core/
│   ├── api.client.ts       # HttpClient wrapper that prefixes /api and injects X-User-Id
│   ├── current-user.store.ts   # who am I? (just an id in localStorage, demo-only)
│   └── api-error.ts        # asApiError() / describeApiError() — UI error helpers
├── shared/
│   ├── components/         # Avatar, RoleBadge, TaskStatusPill — small reusable UI
│   └── utils/date.ts       # formatRelativeDate, initialsOf
├── layout/
│   └── header.ts           # top bar with the user picker + nav
├── users/users.store.ts    # signal store, loaded once per session
└── <feature>/              # projects, tasks, members, invites, attachments
    ├── <feature>.store.ts  # the data layer: signals + API calls
    └── <feature>-*.ts      # the page/widget components
```

**Data flow.** Each domain entity has a singleton `*Store` service (Angular `@Injectable({ providedIn: 'root' })`). The store wraps the `ApiClient`, exposes signals for the data, and provides `load*` / `create` / `update` / `remove` methods. Components read the signals (or `computed()`s derived from them) and call store methods on user actions. There is no NgRx, no global event bus, no resolvers.

**The current user.** `CurrentUserStore` holds the current user's id (defaulting to one of the seeded users so the app works on first load). `ApiClient` injects this store and adds `X-User-Id: <id>` to every outgoing request. Switching the user from the header picker triggers each store to re-load — this is wired implicitly through the existing component effects, not through a global event.

**Routing.** `app.routes.ts` declares lazy-loaded routes only. `withComponentInputBinding()` is enabled so route params arrive as signal inputs (`input.required<string>('id')`) rather than via `ActivatedRoute` snapshots.

---

## Shared types library

`libs/shared-types/` exists for one reason: **the wire-format contract should be expressed once and imported by both apps.** That stops the frontend and backend from drifting on field names, optionality, or string-union values.

What lives here:

- **DTOs** — interfaces that describe request/response payloads (`Project`, `CreateProjectRequest`, `UpdateProjectRequest`, `Task`, ...).
- **String-union constants** — `TASK_STATUSES`, `MEMBER_ROLES`, `INVITE_STATUSES` exported `as const`, with derived `type TaskStatus = (typeof TASK_STATUSES)[number]`.
- **`ApiError`** — the canonical error response shape returned by `ApiExceptionFilter`.

What does **not** live here:

- Mappers / converters / validators (Zod, class-validator, etc.). These are app-internal — keep them next to the code that uses them.
- Runtime business logic of any kind. The library is types-only by design (`tsconfig` emits, but there's no JS runtime entry point worth importing).

> **Open question for the lab:** when a piece of code "feels shared", does it belong here or in the app that needs it? The current rule of thumb is *types yes, code no* — but you'll find the boundary fuzzy in practice. That's the point.

---

## Workspace tooling notes

- **Nx project config** lives in each project's `project.json` (e.g. `apps/web/project.json`). Targets are conventional: `build`, `serve`, `test`, `lint`.
- **Build cache** — Nx caches `build`, `lint`, `test` outputs by default. Reset with `npx nx reset` if you suspect the cache is stale (rare, but the proxy config debugging earlier hit one).
- **Path aliases** — `@aicas/shared-types` resolves to `libs/shared-types/src/index.ts` via `tsconfig.base.json`. Don't import deep paths (`@aicas/shared-types/src/lib/projects` etc.) — only the barrel.
- **`npm run db:reset`** wipes `apps/api/prisma/dev.db`, re-applies migrations, and re-runs `apps/api/prisma/seed.ts`. Cheap and idempotent — run it any time the data feels off.
