# Block 6 + 7 Lab — Project Atlas (Nx Monorepo)

A small but realistic project-management workspace inside an Nx monorepo. Used by **Block 6** (Practical Context Lab) and **Block 7** (Spec-Driven Agent-Based Coding with OpenSpec) of the workshop.

> **Stop here if you haven't done the [environment setup](../../setup/environment-setup.md).** You need Claude Code installed and pointing at MiniMax-M2.7-highspeed (or your assigned model) before any of the exercises below will work.

---

## What this lab is for

Unlike the Block 3+4 contact-list lab — which ships *contextless* on purpose — **this lab ships with a full layered context set already in place.** The Block 6 work is about *discovering the gaps* in that context and *enhancing* it under agent supervision; the Block 7 work is about doing spec-driven development on top of the (improved) context.

You'll spend most of your time reading code, planning with the agent, and writing markdown — actual implementation work is bounded so the supervision and spec discipline are what stand out.

## Run the apps

```bash
cd labs/lab3-nx-monorepo
npm install
npm run db:reset       # wipe + migrate + seed the SQLite DB
npx nx serve api       # NestJS on http://localhost:3000/api
npx nx serve web       # Angular on http://localhost:4200 (proxies /api → :3000)
```

Open <http://localhost:4200/>. Use the user picker in the header to switch between the four seeded demo users (Ada, Grace, Linus, Margaret). Each owns or belongs to different projects — switching users is how you exercise authorization paths.

Other useful scripts (run from the lab folder root):

```bash
npm run build          # build all projects
npm test               # run all tests (web/api/shared-types)
npm run db:reset       # wipe dev.db, re-migrate, re-seed
npm run db:seed        # re-seed only (no schema change)

npx nx serve api       # backend only
npx nx serve web       # frontend only (auto-proxies /api)
npx nx graph           # visualize the workspace
npx nx lint web        # lint a single project
npx nx test api        # test a single project
```

## Stack at a glance

| Concern | Choice |
| --- | --- |
| Workspace | Nx 22 |
| Frontend | Angular 21 (zoneless, standalone, signals, `@if`/`@for`, **inline templates**) + Tailwind 4 |
| Backend | NestJS 11 + class-validator + Prisma 6 |
| Persistence | SQLite (`apps/api/prisma/dev.db`, gitignored) |
| Shared types | `libs/shared-types` (DTOs + string unions, no runtime code) |
| Auth | `X-User-Id` header → middleware-resolved current user. **No real authentication.** |
| Tests | Vitest (web), Jest (api), Vitest (shared-types) |

## What ships in this lab

The **context layer** participants will read, critique, and enhance:

```
labs/lab3-nx-monorepo/
├── AGENTS.md                          ← entry point + pointers to docs/
└── docs/
    ├── ARCHITECTURE.md                ← monorepo layout, request flow, domain model
    └── guidelines/
        ├── TYPESCRIPT.md              ← language conventions
        ├── ANGULAR.md                 ← frontend conventions
        └── NESTJS.md                  ← backend conventions
```

> No `docs/guidelines/VISUAL-STYLEGUIDE.md` — that file deliberately doesn't exist. Path B of Block 6 has you create it from scratch by inspecting the running app.

The **code** behind that context:

```
apps/
├── web/   # Angular SPA — projects list, project detail (tasks/members/invites/attachments tabs)
└── api/   # NestJS REST API — users, projects, tasks, members, invites, attachments
libs/
└── shared-types/   # wire-format DTOs and string-union constants
```

## What does **not** ship in this lab

- A real auth system. `X-User-Id` is the only credential. Don't build a login.
- Blob storage. Attachments are *metadata only* — `url` is whatever string the caller hands in.
- The features Block 7's OpenSpec briefs cover: project archive, project comments, project export. You'll add (one of) those during Block 7 via the spec workflow.
- The `tags` feature Block 6's exercise is about. You'll add that during Block 6 to test your context enhancements.

## Where to go next

| You're doing | Open this |
| --- | --- |
| Block 6 (Practical Context Lab) | [`EXERCISE-BLOCK-6.md`](./EXERCISE-BLOCK-6.md) |
| Block 7 (OpenSpec) | [`EXERCISE-BLOCK-7.md`](./EXERCISE-BLOCK-7.md) |

> **Heads up:** Block 7 builds directly on top of Block 6 in this same codebase. Don't reset between blocks — the AGENTS.md and `docs/` enhancements you make in Block 6 are exactly what makes the OpenSpec proposals dramatically better in Block 7.
