# Reference `AGENTS.md` — Contact List (Block 3+4 Lab)

> **What this is:** the "answer key" `AGENTS.md` for the [`labs/lab1-contact-list/`](../labs/lab1-contact-list/) app. This is what the workshop authors would write for that codebase.
>
> **DO NOT READ THIS BEFORE YOU'VE WRITTEN YOUR OWN.** Block 4 Exercise 4.2 is *"build it yourself first"* — the value is in the act of writing it. Use this file *afterwards* to compare, find what you missed, and steal what reads better than your own version. There's no single right `AGENTS.md`; this is one good one, deliberately conservative.
>
> **Where it lives in a real project:** at the root of the lab folder as `AGENTS.md` (cross-tool: Claude Code, Cursor, Codex CLI, Aider, etc. all read it). Don't name it `CLAUDE.md` — that's tool-specific.
>
> **How long should it be?** This reference is ~150 lines. Yours can be shorter. The goal is *prescriptive enough that a junior contractor seeing this codebase for the first time produces code that fits in*, not *encyclopedic enough to cover every edge case*. When in doubt, leave it out — you can add to it the first time the agent gets something wrong.

---

## File contents

Everything between the `BEGIN AGENTS.md` and `END AGENTS.md` markers below is the entire `AGENTS.md` file, verbatim. Copy-paste it into the lab folder as `AGENTS.md`, point an agent at it, and re-run the planted prompt from Block 3 (*"Add a 'recently viewed contacts' feature..."*) to see how the output changes.

> The content is not wrapped in a markdown code fence on purpose — the file *is* markdown and contains its own fenced code blocks, so a single outer fence would be closed prematurely by the inner ones. Read this file as raw text (or in your editor) when copying.

<!-- ============================ BEGIN AGENTS.md ============================ -->

# AGENTS.md — Contact List

> Small Angular 21 contact list app. State lives in browser `localStorage` only — no backend. The whole point of this codebase, in the workshop context, is to be a **realistic but small** Angular app to practice agent supervision against.

## Stack at a glance

| Layer | Tech | Notes |
| --- | --- | --- |
| Framework | Angular 21 | Standalone components, signals, **zoneless** change detection |
| Templates | Inline, `@if` / `@for` | No `.html` files, no `*ngIf` / `*ngFor` |
| Forms | Reactive forms via `NonNullableFormBuilder` | No template-driven (`ngModel`) forms |
| Styling | Tailwind 4 | CSS-first config in `src/styles.css`, no component `.css` files |
| Errors | `Result<T, E>` wrapper | `src/app/shared/utils/result.ts` |
| Persistence | `localStorage` only | Single store: `ContactService` |
| Tests | Vitest via `@angular/build:unit-test` | `*.spec.ts` co-located with the file under test |

## Run it

```sh
npm install
npm start          # ng serve → http://localhost:4200
npm test           # vitest, runs once
npm run build      # production build
```

To wipe local state, open DevTools → Application → Local Storage and delete the `contacts.v1` key.

## Folder map

```
src/app/
├── app.ts                   # root shell component
├── app.config.ts            # provideRouter + withComponentInputBinding
├── app.routes.ts            # lazy routes for list / new / :id / :id/edit
├── shared/utils/
│   ├── date.ts              # formatRelativeDate (the canonical helper)
│   └── result.ts            # Result<T, E> + ok() / err()
└── contacts/
    ├── contact.model.ts     # Contact, ContactDraft, ContactError
    ├── contact.service.ts   # signal-based store + localStorage
    ├── sample-contacts.ts   # first-load seed
    ├── contact-list/        # all-contacts page
    ├── contact-detail/      # single-contact page
    ├── contact-form/        # used for both create and edit
    └── recently-viewed/     # most-recently-opened sidebar
```

---

## Architecture

A handful of decisions a new contributor would otherwise have to reverse-engineer:

- **One store per domain entity, owned by a service.** `ContactService` is the single source of truth for contacts. It holds a `signal<readonly Contact[]>`, mirrors every mutation to `localStorage`, and exposes the canonical view through `computed()` signals (`contacts`, `count`, `contactsByName`). New domain entities follow the same shape — *do not* introduce a second store-like service for the same data.
- **Components don't sort, filter, or transform persisted data themselves.** They bind to `computed()` signals on the service. If a component needs a derived view that doesn't exist yet, add a `computed()` to the service rather than computing it in the component or the template.
- **Errors return, they don't throw.** All `ContactService` mutations return `Result<T, ContactError>`. Callers handle both branches explicitly. Throwing is reserved for genuinely unexpected programmer errors (e.g. impossible-by-construction states), not validation, not-found, or persistence failures.
- **Route params arrive as signal inputs.** `withComponentInputBinding()` is enabled in `app.config.ts`, so a route like `contacts/:id/edit` reaches the component as `readonly id = input<string | undefined>(undefined)`. Don't reach for `ActivatedRoute.snapshot.paramMap` or subscribe to `paramMap` — use `input()`.
- **Every routed component is lazy-loaded.** See `app.routes.ts` — `loadComponent: () => import('./...').then(m => m.X)`.
- **No HTTP, no backend, no other persistence.** If you find yourself adding `HttpClient`, stop and ask — it's almost certainly outside the scope of this lab.

## Code conventions

Things ESLint can't enforce but the code already follows:

- **Standalone components only.** No `NgModule`. No `standalone: false`. Selector prefix is `app-`.
- **Inline templates and inline styles.** Tailwind utility classes in the template do the styling work. Don't extract `.html` / `.scss` files.
- **`@if` / `@else` / `@for` / `@switch`** for control flow. The codebase has zero `*ngIf` / `*ngFor` / `*ngSwitch` — keep it that way. `@for` requires `track`; use the entity id when possible.
- **Signals over RxJS for state.** RxJS is for genuine streams (HTTP, websockets) — neither of which exists here yet. Don't wrap a signal in a `BehaviorSubject` "just in case".
- **Reactive forms via `NonNullableFormBuilder`.** Form values are typed end-to-end (`FormGroup<ContactFormControls>`). Don't `as any` the form value.
- **DTO field names are camelCase, always.** `firstName`, `createdAt`, `updatedAt` — never `first_name` or `created_at`. The persisted shape in `localStorage` is the contract; keep it consistent.
- **Reach for `src/app/shared/utils/` first.** The canonical helpers are:
  - `formatRelativeDate(input)` — relative time strings ("just now", "5 minutes ago", "yesterday"). Do not roll your own with `Date` arithmetic.
  - `Result<T, E>`, `ok(value)`, `err(error)` — error wrapper (see Architecture above).
  Add new shared helpers to `shared/utils/` only when at least two features need them.
- **`readonly` on every interface field of a persisted record.** Mutate by spreading (`{ ...contact, updatedAt: now }`), never in place.
- **TSDoc on exported types and non-obvious functions.** Comments explain *why*, not *what*. The code shows *what*.

## What goes where

| You're adding... | Put it in |
| --- | --- |
| A new persisted field on `Contact` | `contact.model.ts`, then update `validate()` and the form |
| A new derived view (e.g. "contacts by company") | A new `computed()` on `ContactService`, not in the component |
| A new helper used in two+ places | `src/app/shared/utils/<name>.ts` (with a `*.spec.ts` next to it) |
| A new failure mode | A new variant in `ContactError`, returned via `Result` |
| A new routed page | `loadComponent` entry in `app.routes.ts`, lazy-loaded |
| A new visual primitive used in two+ places | Its own standalone component (e.g. `src/app/shared/components/initials-avatar.ts`) |

When unsure, **read the closest existing feature first.** `ContactService` + `ContactList` is the most complete pair to imitate.

---

## Tests

- **Vitest** via `@angular/build:unit-test`. `npm test` runs the whole suite.
- Co-locate `*.spec.ts` next to the file under test (`date.ts` ↔ `date.spec.ts`, `contact.service.ts` ↔ `contact.service.spec.ts`).
- New service logic ships with at least one test that exercises both the success and the `err` branch of the `Result`.
- Keep tests focused on public behaviour (rendered output, store invariants), not implementation details.

---

## Version control

- **Conventional Commits.** Scope is the area touched (`feat(contacts):`, `fix(form):`, `chore(deps):`, `docs:`, `test(date):`).
- **One feature per commit.** Don't fold unrelated chores into a feature commit. Run `git log --oneline` for the existing tone — except the deliberately-bad `UNSUPERVISED AGENT OUTPUT` commit, which is a planted review exercise, not a model.
- **Commit body explains *why*, not *what*.** The diff already shows what.
- **Don't `git push --force`** or `git rebase -i` against shared branches without confirmation. **Don't `git commit --amend`** a commit you didn't author in the current session.

---

## What to do when this file doesn't cover your case

1. Check what an existing feature does — `contacts/contact-list/` + `ContactService` is the most complete reference.
2. If two features do it differently, the older one is probably accidentally older, not intentionally different. Pick the cleaner pattern.
3. Surface the gap before guessing — a one-line "I don't see a convention for X, here are two reasonable ways" is much cheaper to course-correct than the wrong choice already coded up.

<!-- ============================= END AGENTS.md ============================= -->

---

## Why this `AGENTS.md` looks the way it does

A few choices worth flagging — useful when you're comparing your own version to this one:

- **Anchored to actual files.** Every claim about the codebase points at a real path (`src/app/shared/utils/result.ts`, `app.config.ts`, `ContactService`). A junior agent treats *named* files as ground truth and ignores vague principles.
- **Decisive, not encyclopedic.** It tells the agent which of the available options to pick (signals over RxJS, `Result` over throw, `@if` over `*ngIf`) instead of explaining the trade-offs. The trade-off discussion lives in PR review, not here.
- **A "what goes where" table.** Most of the Block 3 review failures are filing-cabinet failures — the agent put the right code in the wrong place. The table replaces three paragraphs of prose with a lookup.
- **Anti-patterns named explicitly.** `BehaviorSubject` for state, `*ngIf` / `*ngFor`, snake_case fields, `.html` extraction, rolling-your-own date math — all called out by name. Naming the wrong thing is what stops the agent from doing it; vague "follow the existing patterns" doesn't.
- **No commitment to a refactor that might land later.** It doesn't say "we will move state to NgRx" or "Result will be deprecated". `AGENTS.md` describes *how the code is written today*, not how someone wishes it were written. Aspirational `AGENTS.md` files age into lies.
- **No NgRx / SignalStore mention.** The lab doesn't use them and adding them would be scope creep. If a real project did use one, this file would say so once and link to the relevant `docs/` page rather than embedding the pattern inline.
- **Commit conventions are short on purpose.** Three bullets is enough for a single-developer lab; the workshop's `WORKING-MODE.md` covers the broader version-control discipline.

## What's deliberately not here

- **Linting rules.** `eslint.config.mjs` (or whatever the project uses) is the source of truth — duplicating it in `AGENTS.md` creates drift.
- **A full architecture diagram.** Overkill for a single-service localStorage app. In the larger Block 6+7 lab, that lives in `docs/ARCHITECTURE.md` and is *referenced* from `AGENTS.md`, not embedded.
- **A list of "principles" (SOLID, DRY, YAGNI, ...).** Junior agents already know these and they don't change behaviour. The codebase-specific anti-patterns above do.
- **Tutorials / explanations.** The agent has those in its training data already. `AGENTS.md` is *project-specific* knowledge — what the agent *cannot* infer from its general Angular training.

## When to split this into `docs/`

This single file works because the lab is small. The signal that it's time to split into a pointer `AGENTS.md` + `docs/` folder is:

- The file passes ~250 lines and you start losing track of where things are when you scroll.
- Two or more sections grow long enough that you'd rather link them than scroll through them.
- A new contributor asks a question and you find yourself answering by paraphrasing — that's a section that belongs in its own file.

The Block 6+7 lab demonstrates the layered shape (`AGENTS.md` as a pointer to `docs/ARCHITECTURE.md` + `docs/guidelines/{TYPESCRIPT,ANGULAR,NESTJS,WORKING-MODE}.md`) — read [`labs/lab3-nx-monorepo/AGENTS.md`](../labs/lab3-nx-monorepo/AGENTS.md) for that variant.
