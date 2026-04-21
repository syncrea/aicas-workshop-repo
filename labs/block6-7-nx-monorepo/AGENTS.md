# AGENTS.md — Project Atlas (Block 6 + 7 Lab)

> **You are about to work on a small but real Nx monorepo:** an Angular 21 frontend (`apps/web`) and a NestJS 11 backend (`apps/api`) sharing a typed contract through `libs/shared-types`. This file is the **entry point** — short on purpose. Most of the depth lives in [`docs/`](./docs/) and is referenced from here.

---

## What this codebase is

**Project Atlas** is a lightweight project management workspace: users own and join *projects*, projects have *tasks* (todo / in-progress / done), *members* (with roles), open *invites*, and uploaded *attachments* (file metadata only — the workshop ships no blob storage). It exists to give Block 6 and Block 7 a realistic, multi-app codebase to practice context engineering and spec-driven development on.

There is **no real authentication.** The "currently logged-in user" is whoever is named in the `X-User-Id` request header — the frontend's header picker is the closest thing to a login screen. Treat this as a deliberate workshop simplification, not a pattern to copy.

## Stack at a glance

| Layer | Tech | Notes |
| --- | --- | --- |
| Workspace | Nx 22 | `nx.json`, project-level `project.json`, root `package.json` for scripts |
| Frontend | Angular 21, Tailwind 4 | Standalone components, signals, zoneless change detection, **inline templates**, `@if` / `@for` |
| Backend | NestJS 11 | Modular, `class-validator` DTOs, global `ValidationPipe` + `ApiExceptionFilter` |
| Shared types | `libs/shared-types` | Wire-format DTOs and string-union constants only — no runtime code |
| Persistence | SQLite via Prisma 6 | `apps/api/prisma/schema.prisma` is the schema source of truth |
| Tests | Vitest (web), Jest (api), Vitest (shared-types) | All run via `npm test` at the workspace root |

## Run it

From the lab folder root (`labs/block6-7-nx-monorepo/`):

```sh
npm install
npm run db:reset       # wipe + migrate + seed the SQLite DB
npx nx serve api       # NestJS on http://localhost:3000/api
npx nx serve web       # Angular on http://localhost:4200 (proxies /api → :3000)
```

Open http://localhost:4200/ and use the user picker in the header to switch between the four seeded demo users (Ada, Grace, Linus, Margaret).

Useful targets:

```sh
npm run build          # build all projects
npm test               # run all tests
npx nx lint web        # lint a single project
npx nx graph           # visualize the workspace
```

## How to work in this repo

> **Read this first, before touching any code.** [`docs/guidelines/WORKING-MODE.md`](./docs/guidelines/WORKING-MODE.md) defines the working agreement between you (the agent) and the human supervising you — verify instead of assuming, work in reviewable chunks and pause for confirmation, surface uncertainty, stay in scope, report honestly. The code conventions below only matter if the working mode is right.

## Where to look first

Read in this order — each file points to the next:

1. **[`docs/guidelines/WORKING-MODE.md`](./docs/guidelines/WORKING-MODE.md)** — *how* to work: verification, chunked progress with human checkpoints, honest reporting, scope discipline.
2. **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** — the two-app + one-lib layout, request flow, persistence model, the `X-User-Id` auth simplification.
3. **[`docs/guidelines/TYPESCRIPT.md`](./docs/guidelines/TYPESCRIPT.md)** — language-level conventions used by both apps and the shared lib.
4. **[`docs/guidelines/ANGULAR.md`](./docs/guidelines/ANGULAR.md)** — frontend conventions (signals, control flow, routing, store pattern, inline templates).
5. **[`docs/guidelines/NESTJS.md`](./docs/guidelines/NESTJS.md)** — backend conventions (module shape, controllers, services, DTOs, error responses).

When the answer to *"where should this code live?"* isn't in those files, fall back to **looking at how an existing feature does it** — `projects` is the most complete reference module on both the frontend and the backend.

## Workspace layout

```
labs/block6-7-nx-monorepo/
├── apps/
│   ├── api/                # NestJS backend
│   │   ├── prisma/         # schema.prisma + migrations + seed
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app/        # AppModule
│   │       ├── auth/       # CurrentUserMiddleware + @CurrentUser decorator
│   │       ├── common/     # ApiExceptionFilter, mappers
│   │       ├── prisma/     # PrismaService + global module
│   │       └── <feature>/  # users, projects, tasks, members, invites, attachments
│   └── web/                # Angular frontend
│       ├── proxy.conf.js   # /api → http://127.0.0.1:3000
│       └── src/app/
│           ├── core/       # ApiClient, CurrentUserStore, api-error
│           ├── shared/     # reusable Avatar, RoleBadge, TaskStatusPill, date utils
│           ├── layout/     # app header
│           └── <feature>/  # users, projects, tasks, members, invites, attachments
└── libs/
    └── shared-types/       # wire-format DTOs + string unions
```

## Coding conventions in one breath

- **TypeScript everywhere**, strict mode, no `any` outside `// eslint-disable` islands.
- **Frontend:** signals over RxJS, `@if`/`@for` over `*ngIf`/`*ngFor`, standalone components, **inline templates**, lazy-loaded routes, one signal-based store per domain entity (`*Store` services in `core/` or feature folders).
- **Backend:** one Nest module per domain entity, controllers stay thin, services hold business logic + Prisma calls, DTOs in `dto/` subfolders, errors thrown as `Nest*Exception` and serialised by `ApiExceptionFilter`.
- **Shared types:** wire-format only. No mappers, no functions, no Zod schemas — just `interface`s and `as const` string unions.
- **Commits:** Conventional Commits, one feature per commit, body explains *why*. Look at `git log --oneline` for the existing tone.

## Version control

- Use Conventional Commits (`feat(api):`, `fix(web):`, `chore(shared-types):`, `docs:`).
- Don't squash unrelated changes into one commit.
- Don't `git push --force` or `git rebase -i` against shared branches without confirmation.
- Don't `git commit --amend` a commit you didn't author in the current session.

## What to do when context is missing

This codebase ships with intentionally **thin** documentation in places — the Block 6 lab is partly about discovering and filling those gaps. If you (the agent) hit a question the existing context doesn't answer:

1. **Say so explicitly** in your plan. Don't guess and proceed. (See `WORKING-MODE.md` → *Make uncertainty visible*.)
2. Look at the closest existing feature for a pattern.
3. If you need to verify behaviour rather than guess at it, do so — run the relevant test, hit the endpoint, read the third-party source. (See `WORKING-MODE.md` → *Verify, don't assume*.)
4. If the human asks you to enhance a doc, write the enhancement into the **right existing file** under `docs/`, not into AGENTS.md. AGENTS.md stays a pointer document.
