# OpenSpec Feature Briefs (Block 7)

> Three feature briefs for the Block 7 OpenSpec hands-on. **Pick one** — by interest, not by perceived difficulty. They're each scoped to fit the lab's `/opsx:propose → review → /opsx:apply` loop in ~50 minutes on the Block 6 Nx monorepo.

You'll be working in the **same Nx monorepo from Block 6** — same Angular frontend, same NestJS backend, same `AGENTS.md` + `docs/guidelines/*` you enhanced in Block 6. That existing context is exactly what makes the proposal step interesting: OpenSpec generates dramatically better proposals when the agent has good context to reference.

---

## The three briefs

| # | File | One-line summary |
|---|------|------------------|
| 1 | [`01-project-archive.md`](./01-project-archive.md) | Soft-delete projects, exclude them from default lists, allow restore |
| 2 | [`02-project-comments.md`](./02-project-comments.md) | Comments on projects, with `@mentions`, on backend + frontend |
| 3 | [`03-project-export.md`](./03-project-export.md) | Export a project to JSON, including all related entities |

**Each brief is intentionally 1–2 paragraphs** — they leave decisions on the table that the spec phase is supposed to surface. *That's the point.* If the brief tells you exactly what to build, the spec can't earn its keep.

---

## How to use a brief

1. Pick one. Don't agonise — there's no "best" choice.
2. Run `/opsx:propose <chosen-feature>` and let OpenSpec generate the change folder under `openspec/changes/<chosen-feature>/`.
3. Read every artifact in order: `proposal.md` → `specs/*` → `design.md` → `tasks.md`.
4. **Review and refine** using the OpenSpec proposal review checklist:
   - **`proposal.md`** — Is the motivation clear? Are non-goals stated? Does it explain *why*, not just *what*?
   - **`specs/*`** — Are acceptance criteria testable? Are edge cases included?
   - **`design.md`** — Does it match conventions from `docs/guidelines/*`? Is the data model aligned with existing patterns?
   - **`tasks.md`** — Are tasks atomic? Ordered? Are migrations / seed data first?
5. Push back on the agent. Have it update artifacts in place. Re-read until you'd hand the spec to a junior.
6. `/opsx:apply` — work through `tasks.md` task by task, reviewing each diff as it lands.
7. Don't expect to *finish* the feature in 10 minutes of apply time. The goal is to **experience the apply loop**, not ship.

---

## Common ambiguities the spec phase should surface

These are deliberate. If the agent's first proposal already has clean answers, you skipped a refinement opportunity — push back harder.

- **Soft-delete semantics:** what happens to related entities? Hard-cascade, soft-cascade, orphan, prevent-archive?
- **Authorization:** who can do this? The owner only? Any team member? Admin only? Inherited from a parent permission?
- **Pagination & sort:** new list endpoints — what's the default page size? sort? filter shape? Match the existing pattern.
- **Validation:** which library? class-validator? Zod? Manual? Match what's already in the NestJS module.
- **Naming / casing:** snake_case vs camelCase in DTOs vs DB columns. The Nx monorepo has a convention — find it and follow it.
- **Migrations:** schema changes. New table? New column? Default value? Backfill required?
- **Audit trail:** does this need a who/when log? Some teams require it for any soft-delete or destructive op.
- **Frontend updates:** do existing list views need to filter out the new state? Where does the new UI live in the route tree?

---

## After Block 7

The brief you picked, the change folder you generated, the diffs you applied — all of it stays in the Nx monorepo's git history. **You don't need to clean it up.** When you move into Block 8 you'll be working in a brand-new repo of your own choosing, on your own stack. The Nx monorepo is the Block 6 + 7 surface; what you take *out* of it is the supervision instinct, not the code.
