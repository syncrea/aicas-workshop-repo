# Block 7 — Spec-Driven Agent-Based Coding with OpenSpec

> **Block goal:** experience the full OpenSpec workflow — propose, review, refine, apply — on a realistic codebase that already has good context. By the end you should have a felt sense for how specs and context engineering reinforce each other.

You'll continue working in the **same Nx monorepo from Block 6** — same Angular frontend, same NestJS backend, **same AGENTS.md + `docs/guidelines/*` you enhanced in Block 6.** That existing context is exactly what makes the proposal step interesting: OpenSpec generates dramatically better proposals when the agent has good context to reference.

> **Before starting:** make sure you can still run both apps (`npx nx serve api`, `npx nx serve web`) and that your Block 6 context enhancements are committed.

---

## Step 1 — Install and initialize OpenSpec (5 min)

OpenSpec ships as a global CLI that registers slash commands with your AI tool.

```bash
npm install -g @fission-ai/openspec@latest
```

Then, **from this lab folder root**:

```bash
cd labs/block6-7-nx-monorepo
openspec init
```

Inspect what was created:

- A new `openspec/` folder at the lab root.
- The slash commands `/opsx:propose`, `/opsx:apply`, `/opsx:archive` are now available in Claude Code (visible via `/help` or by typing `/`).
- Any updates OpenSpec made to your AGENTS.md / CLAUDE.md or other agent-instruction files — read the diff before accepting.

**Quick voice check-in:** the facilitator will ask 1–2 volunteers to describe what changed.

---

## Step 2 — Choose a feature brief and propose (15 min)

Three feature briefs ship with the workshop repo at [`../../openspec-feature-briefs/`](../../openspec-feature-briefs/) — they're each scoped to fit this lab's `/opsx:propose → review → /opsx:apply` loop in ~50 minutes on this Nx monorepo. **Pick one — by interest, not by perceived difficulty.**

| # | Brief | One-liner |
| - | --- | --- |
| 1 | [`01-project-archive.md`](../../openspec-feature-briefs/01-project-archive.md) | Soft-delete projects, exclude them from default lists, allow restore |
| 2 | [`02-project-comments.md`](../../openspec-feature-briefs/02-project-comments.md) | Comments on projects, with `@mentions`, on backend + frontend |
| 3 | [`03-project-export.md`](../../openspec-feature-briefs/03-project-export.md) | Export a project to JSON, including all related entities |

Read your chosen brief, then start a fresh Claude Code session in this folder and run:

```
/opsx:propose <chosen-feature>
```

Pass the actual feature name as the argument — e.g. `/opsx:propose project-archive`. OpenSpec generates a change folder under `openspec/changes/<chosen-feature>/`:

```
openspec/changes/<chosen-feature>/
├── proposal.md   ← why we're doing this, what's changing
├── specs/        ← requirements and scenarios
├── design.md     ← technical approach
└── tasks.md      ← implementation checklist
```

**Read every artifact in order:** `proposal.md` → `specs/*` → `design.md` → `tasks.md`. Note what's good, what's missing, what assumes too much. Don't apply anything yet.

---

## Step 3 — Review and refine the spec (15 min)

> This is the **supervision step at the spec layer** — same review discipline as code review, applied before any code exists.

Use the **OpenSpec proposal review checklist** (also in [`../../openspec-feature-briefs/README.md`](../../openspec-feature-briefs/README.md)):

- **`proposal.md`** — Is the motivation clear? Are non-goals stated? Does it explain *why*, not just *what*?
- **`specs/*`** — Are acceptance criteria testable? Are edge cases included?
- **`design.md`** — Does it match conventions from `docs/guidelines/*`? Is the data model aligned with existing patterns?
- **`tasks.md`** — Are tasks atomic? Ordered? Are migrations / seed data first?

Push back on the agent. Examples of useful pushback:

- *"The proposal doesn't say what happens when an archived project has open comments — add that to the specs."*
- *"`design.md` picked an enum but the project uses string-union constants in `libs/shared-types` — fix that."*
- *"`tasks.md` is missing the migration step."*
- *"The validation approach in `design.md` doesn't match what NESTJS.md says about DTOs — reconcile or surface the disagreement."*
- *"Authorization rule for delete-comment is unclear — match `requireOwnerOrAdmin` from `projects.service.ts`."*

Have the agent update the artifacts **in place**. Re-read until you'd be comfortable letting an unsupervised junior implement from this spec.

The [`README.md`](../../openspec-feature-briefs/README.md) of the feature briefs also lists "common ambiguities the spec phase should surface" — if the agent's first proposal already cleanly resolves all of them, you skipped a refinement opportunity. Push back harder.

---

## Step 4 — Apply the spec (10 min)

```
/opsx:apply
```

The agent works through `tasks.md` task by task. **Review each diff as it lands** — Block 3 supervision discipline still applies. Catch any drift between spec and implementation early; refine the spec or steer the agent rather than fixing things at the code level.

> **Don't expect to finish the whole feature in 10 minutes.** The goal is to *experience the apply loop*, not ship the feature. Stop when the time runs out.

When you stop, the work is captured in `openspec/changes/<chosen-feature>/` plus whatever code diffs the apply produced. **You don't need to clean it up** — the artifacts staying around in the repo is part of what makes spec-driven development different from prompt-driven development.

If you do want to formally close out the change you started:

```
/opsx:archive <chosen-feature>
```

That moves the change folder to `openspec/changes/archive/` and locks it as part of the project's history.

---

## Step 5 — Plenary debrief (5 min, voice-led)

Facilitator opens the floor. Useful prompts:

- *Where did the spec catch ambiguity that a regular prompt would have missed?*
- *Where did the agent drift from the spec during apply? How early did you catch it?*
- *Did the Block 6 context (AGENTS.md, the docs/ folder you enhanced) make the proposal noticeably better?*
- *Where would you split a single brief into two smaller changes if you ran this again?*

2–3 volunteers screen-share their `proposal.md` and a key diff. Other participants chime in by voice. Quick written observations go into the **Block 7 → OpenSpec Lab Observations** section of the workshop Google Doc; chat stays for ad-hoc snippet links.

---

## What you should walk out of Block 7 with

- Hands-on experience with the full OpenSpec workflow — propose, review, refine, apply — on a realistic codebase with good context.
- A felt sense for how specs and context engineering reinforce each other (not how they substitute for each other).
- Enough familiarity with `/opsx:propose` / `/opsx:apply` / `/opsx:archive` to evaluate whether OpenSpec — or one of the heavier alternatives mentioned in the presentation (Spec Kit, GSD) — would fit your team's workflow back at work.

---

## After Block 7

The brief you picked, the change folder you generated, the diffs you applied — all of it stays in the Nx monorepo's git history. **You don't need to clean it up.** When you move into Block 8 you'll be working in a brand-new repo of your own choosing, on your own stack. The Nx monorepo is the Block 6 + 7 surface; what you take *out* of it is the supervision instinct, not the code.
