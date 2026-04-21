# Block 6 — Practical Context Lab

> **Block goal:** prove to yourself that *the right context distributed across the right files* changes what an agent produces — on a more representative codebase than the contact app, with real Nx workspace, real backend, real cross-app contract.

You'll work in this same Nx monorepo for both Block 6 and Block 7. Don't reset between blocks — the context enhancements you make here are exactly what makes Block 7's OpenSpec proposals dramatically better.

> **Before starting:** make sure both apps are running (`npx nx serve api` and `npx nx serve web` in two terminals) and the seeded data shows up at <http://localhost:4200/>.

---

## The feature brief — "project tags"

Throughout this lab you'll plan, partially implement, and re-plan **the same small feature**: project tags.

> **Add a `tags` feature to Project Atlas.** Tags are short labels (max ~24 chars) that can be attached to a project. The backend exposes CRUD for tags scoped to a project (`GET/POST/DELETE /api/projects/:projectId/tags`). The project list page shows tag chips on each project card, and the project detail page lets the current user add and remove tags on projects they own or admin. The list page gets a tag-filter that hides projects without any of the selected tags.

Deliberately small but cross-cutting: it touches Prisma (new table), the shared types library, a new Nest module, the existing Angular project list and detail screens, and the visual layer (chip styling). It will surface every gap in the existing context if you let it.

---

## Step 1 — Orient (10 min)

> Goal: build a mental map of what's already documented before you do anything else.

1. **Read [`AGENTS.md`](./AGENTS.md)** at the lab root. Notice it's a *pointer* document, not an encyclopaedia.
2. **Skim each `docs/` file** in the order AGENTS.md links them:
   - [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
   - [`docs/guidelines/TYPESCRIPT.md`](./docs/guidelines/TYPESCRIPT.md)
   - [`docs/guidelines/ANGULAR.md`](./docs/guidelines/ANGULAR.md)
   - [`docs/guidelines/NESTJS.md`](./docs/guidelines/NESTJS.md)
3. **Click around the running app** for two minutes. Switch users in the picker, open a project, look at the tabs (Tasks / Members / Invites / Attachments), try to delete something as a non-admin and watch the error.

**Optional — Codanna:** if you want exploration to go faster, enable Codanna on this repo using the same setup recipe from Block 5 (`codanna index .` + register the MCP server). The Nx monorepo is exactly the kind of "large-enough-to-grep-poorly" codebase Codanna shines on, and the agent will pick it up automatically once it's registered. Skip if you'd rather stay focused on context-engineering mechanics — Codanna is a force multiplier, not a prerequisite.

---

## Step 2 — Discover the gaps (20 min)

> Goal: let the agent surface what the existing context doesn't cover, by giving it a real planning task.

In this folder, start a fresh Claude Code session:

```bash
cd labs/lab3-nx-monorepo
claude
```

Switch to **Plan mode** (`/mode plan` or whatever shortcut your tool uses — the one where it can read but can't write). Then ask:

> Plan the implementation of a project-tags feature for this codebase. Tags are short labels (max 24 chars) attached to projects. Add backend CRUD scoped to a project (`GET`/`POST`/`DELETE /api/projects/:projectId/tags`), tag chips on the project cards in the list view, an add/remove UI on the project detail page (visible only to owners and admins), and a tag filter on the list page. Read AGENTS.md and the docs/ folder before proposing the plan.

Let it think. **Don't approve anything yet.** Read the plan critically.

The agent will likely surface gaps. **Write each one down** in the workshop Google Doc's Block 6 → Lab Work Log table (`[S2] gap: ...`). Common ones to expect on this codebase:

- *"I'm not sure which Nx generator to scaffold a new module/lib with"* — AGENTS.md and ARCHITECTURE.md don't mention generators at all.
- *"Should the tag types live in `libs/shared-types` or in `apps/api`/`apps/web`? The architecture doc calls the boundary 'fuzzy'."*
- *"I don't see a documented null-handling convention — should optional fields be `?: T`, `T | null`, or both?"*
- *"How should the new DTO be validated? I see `class-validator` decorators on existing DTOs but no doc explaining the validation pipeline."*
- *"There's no styling guide — should chips use the project color, the role-badge style, or something else?"*
- *"Authorization for `POST /tags` — owner-only? admin-and-owner? any member? The existing pattern is `requireOwnerOrAdmin` but it's not stated which mutations follow it."*

Add any *you* spotted while reading the docs in Step 1. **You're aiming for at least 3, ideally 5+ concrete gaps.** This is the raw material for Step 3.

---

## Step 3 — Improve the context set (15 min)

> Goal: feel the Block 4 lesson again — *the agent writes context under your supervision, you don't hand-author it* — but on a layered context set this time.

Pick **one** path. The choice is by interest in the gap you found, not by difficulty. The facilitator will demo the other path live in the debrief, so everyone sees both shapes.

### Path A — Enhance an existing file

Pick **one** of the gaps from Step 2 and ask the agent to propose an enhancement to the *right existing file* — AGENTS.md, ARCHITECTURE.md, TYPESCRIPT.md, ANGULAR.md, or NESTJS.md.

For example, if you picked the Nx-generator gap:

> Propose an addition to AGENTS.md (or ARCHITECTURE.md if it fits better) that documents which Nx generators we use to scaffold new modules, libraries, and components. Inspect `nx.json`, the existing `apps/`, `libs/` and the installed `@nx/*` packages to ground your suggestion in what's actually configured. Show me the diff before applying it.

Read the proposal critically. Push back. Refine. **Then** exit Plan mode and have the agent apply the change.

### Path B — Create `docs/guidelines/VISUAL-STYLEGUIDE.md` from scratch

The codebase has no documentation for visual conventions yet. Ask the agent to:

1. **Inspect** the running Angular app's global styles (`apps/web/src/styles.css`), the existing component styles, the colors used in `Avatar` / `RoleBadge` / `TaskStatusPill`, and Tailwind utility patterns that repeat across `project-list.ts`, `project-detail.ts`, and `task-board.ts`.
2. **Propose** a new file `docs/guidelines/VISUAL-STYLEGUIDE.md` written in the same voice and shape as the other guideline files (TYPESCRIPT.md, ANGULAR.md, NESTJS.md).
3. **Add a reference** to the new file from AGENTS.md so the agent will discover it next time.

Review the proposal. Refine *one* pass — don't polish. Then have the agent write it.

> **Either path** finishes with at least one file modified or created. Commit it: `git add -A && git commit -m "docs(context): <what you changed>"`. The diff is your evidence that you did the lab.

---

## Step 4 — Test the enhanced context with a fresh agent session (10 min)

> Goal: confirm the context actually changes what the agent produces. The diff is the test.

**Start a brand-new agent session** — kill Claude Code and re-launch — so the agent can't rely on the conversation history of the previous steps. Only the files on disk count.

Pick a small slice of the tag feature that exercises the gap you just filled:

- *Path A on Nx generators* → "Scaffold the new tags module on the backend using the right Nx generator, then stop."
- *Path A on null-handling / validation pipeline* → "Build the `CreateTagDto` and `tags.service.ts` skeleton end-to-end, including validation rules and error responses, then stop."
- *Path B (visual styleguide)* → "Build a new `<app-tag-chip>` component in `apps/web/src/app/shared/components/`, used by the project card. Make it match the existing visual conventions, then stop."

The agent should now:

- Use the right Nx generator (because AGENTS.md / ARCHITECTURE.md were enhanced) — *if you went Path A on generators*.
- Apply the correct validation and error patterns (because NESTJS.md / TYPESCRIPT.md were sharpened) — *if you went Path A on those*.
- Match the visual conventions from the new VISUAL-STYLEGUIDE.md — *if you went Path B*.

Compare against what came out in Step 2's plan. **Visible improvement on the same codebase, driven only by better context.**

Add a one-line note to the workshop Google Doc Lab Work Log: `[S4] <observation>`.

---

## Throughout the lab

- Add one-line notes to the workshop Google Doc's **Block 6 → Lab Work Log** table — columns: *initials, step (S1–S4), one-line observation*. Examples:
  - `[S2] gap: no Nx generator guidance`
  - `[S3] enhanced TYPESCRIPT.md with null-handling rule`
  - `[S4] agent matched chip styling on first try after VISUAL-STYLEGUIDE.md`
- Voice-channel any time you're stuck. The facilitator drops into individual screens for live coaching, especially during Steps 2 and 3 where people get stuck most often.
- The chat channel is for ephemeral signals (`🆘`, links, quick questions). Anything worth keeping goes into the Google Doc.

---

## What you should walk out of Block 6 with

- A felt sense of when a single AGENTS.md stops scaling and a layered set of `docs/` files starts paying off.
- One concrete enhancement to the lab's context — either a sharpened existing file or a brand-new VISUAL-STYLEGUIDE.md — written by the agent under your supervision and committed.
- Evidence (in the Step 4 fresh-session diff) that the enhancement changed what the agent produced.
- The same Nx monorepo, ready for Block 7's OpenSpec exercise on top of your now-better context.

---

## Day 1 retrospective (10 min, end of Block 6)

Spend ~4 min adding entries to the **Day 1 Retrospective** section of the workshop Google Doc — three pre-built columns: *What worked / What didn't / Questions still open*. Anything that needs follow-up but isn't a retro item goes into the **Parking Lot** section the facilitator will revisit on Day 2 morning.

Facilitator screen-shares the retro section, calls out the dominant threads by voice (~3 min), names the day's key learnings, previews Day 2 (~3 min: from context to specs to full workflows). Brisk on purpose — Day 1 retros run lean because everyone's tired and most reflection lands in the parking lot anyway.
