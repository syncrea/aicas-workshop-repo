# Block 3+4 Lab — Contact List

A small Angular 21 contact list app, intentionally shipped **without any
AI agent context** — no `AGENTS.md`, no `docs/`, no `.cursor/rules/`, no
`.claude/`. That's the whole point: Block 3 has you point an unsupervised
agent at this codebase and observe what happens, and Block 4 has you build
the context layer that fixes it.

> **Stop here if you haven't done the [environment setup](../../setup/environment-setup.md).**
> You need Claude Code installed and pointing at MiniMax-M2.7-highspeed
> (or your assigned model) before any of the exercises below will work.

---

## Run the app

```bash
cd labs/lab1-contact-list
npm install
npm start
```

Open http://localhost:4200/. The first load seeds ten well-known computer
scientists into `localStorage` so you have something to look at.

Other useful scripts:

```bash
npm test            # Vitest, runs once
npx ng test         # Vitest in watch mode
npm run build       # production build
```

To wipe local state and start over with the seed data again, open DevTools
→ Application → Local Storage and delete the `contacts.v1` key.

---

## What the app actually does

- List all contacts (sorted alphabetically by last name).
- Open a contact's detail page.
- Create / edit / delete contacts.
- Track a "recently viewed" sidebar — *added in the last commit, and
  this is where Block 3 starts.*

State lives in browser `localStorage` only — no backend. That keeps the
focus on agent supervision rather than infrastructure.

## Stack at a glance

| Concern | Choice |
| --- | --- |
| Angular | 21.x, standalone components, signals, zoneless |
| Templates | Inline, `@if` / `@for` syntax |
| Forms | Reactive forms via `NonNullableFormBuilder` |
| Errors | `Result<T, E>` wrapper from `src/app/shared/utils/result.ts` |
| Styling | Tailwind 4 (CSS-first config) |
| Tests | Vitest via `@angular/build:unit-test` |
| Persistence | `localStorage` |

## Folder map

```
src/app/
├── app.ts                   # root component shell
├── app.config.ts            # provideRouter + withComponentInputBinding
├── app.routes.ts            # lazy routes for list / new / :id / :id/edit
├── shared/
│   └── utils/
│       ├── date.ts          # formatRelativeDate (the canonical helper)
│       ├── date.spec.ts
│       └── result.ts        # Result<T, E> + ok() / err()
└── contacts/
    ├── contact.model.ts     # Contact, ContactDraft, ContactError
    ├── contact.service.ts   # signal-based store + localStorage
    ├── contact.service.spec.ts
    ├── sample-contacts.ts   # first-load seed
    ├── contact-list/
    ├── contact-detail/
    ├── contact-form/        # used for both create and edit
    └── recently-viewed/     # ← this folder is the Block 3 review surface
```

## Where to go next

| You're doing | Open this |
| --- | --- |
| Block 3 (Permissions, Modes, Diff Review) | [`EXERCISE-BLOCK-3.md`](./EXERCISE-BLOCK-3.md) |
| Block 4 (Context with AGENTS.md and docs) | [`EXERCISE-BLOCK-4.md`](./EXERCISE-BLOCK-4.md) |

> **Heads up:** Block 4 builds directly on top of Block 3 in this same
> codebase. Don't reset between sessions — the AGENTS.md you'll write in
> Block 4 is supposed to encode the lessons from your Block 3 review.
