# Block 8 — Build Your Own (Harness Setup Procedure)

> **3:30 spanning lunch.** Day 2's biggest hands-on block. You assemble the **AI agent harness** you've been building piece by piece across Blocks 1–7 and apply it to a project of *your* choosing — your stack, your app idea, your conventions.

By Block 7 you have all the building blocks: supervision discipline (Block 3), context engineering (Blocks 4 & 6), MCPs (Block 5), spec frameworks (Block 7). Using them on a pre-built workshop codebase has diminishing returns. The most valuable thing now is **assembling the full harness on a project you actually care about**, so the patterns transfer to your day-to-day work after the workshop.

---

## What "harness" means here

The **AI agent harness** is the complete operating environment around the model:

| Layer | What you choose | Block where we built it |
|-------|-----------------|-------------------------|
| Tool & model | Claude Code → MiniMax-M2.7-highspeed | Block 2 |
| Supervision discipline | Plan → Execute → Review | Block 3 |
| Context layer | `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/guidelines/*.md` | Blocks 4 & 6 |
| Tool extensions | MCP servers (Codanna, Chrome DevTools, Context7) | Block 5 |
| Spec layer | OpenSpec | Block 7 |

The model alone is one component. The harness is what turns a smart model into a productive collaborator — and a *bad* harness is why the same model produces sloppy code in one project and great code in another.

---

## Inter-day homework (recap)

If you did the recommended 30–60 min of pre-work between Day 1 and Day 2 — picked a stack/idea, scaffolded, made an initial commit — you'll move into **Phase 2** early and use the freed time to go deeper in Phase 3 or Phase 5. If you didn't, no problem: Phase 1 is reserved for in-workshop scaffolding, and you'll catch up by lunch.

If you have **no idea what to build**, see [`block8-project-ideas.md`](./block8-project-ideas.md) — pick anything from there and don't agonize over the choice.

---

## Part 1 (before lunch, 2:00) — Frame, choose, set up the harness

### Framing & Recap (15 min, presentation)

The facilitator walks through this procedure, names each phase, and re-anchors the harness diagram. Make sure you can name the five layers.

### Choose your project (10 min, individual)

- **Stack:** anything you actually use or want to learn. Workshop tooling is stack-agnostic.
- **App idea:** small enough to scope in **two slices**, real enough that you care about it. See `block8-project-ideas.md` if stuck.
- **Add yourself to the workshop Google Doc** → *Block 8 → Stack & Idea Roster* table. Columns: *initials, stack, app idea, first slice*.

> ⚠️ **Pick a stack you've scaffolded in the past month** if at all possible. Block 8 isn't the moment to learn `dotnet new` for the first time — that eats 30+ minutes that should go into supervision practice.

### Phase 1 — Scaffold + git baseline (15 min)

**If you pre-scaffolded last week:**
1. `git status` — confirm clean working tree
2. Confirm initial commit exists: `git log --oneline | head`
3. Confirm the project still runs (the stack's "hello world" command)
4. Move to Phase 2 early — use the freed time to go deeper in Phase 3 or 5

**If you didn't pre-scaffold:**
1. **`git init` BEFORE anything else** — agents have been known to wipe folders
2. Scaffold with the stack's standard CLI. Recipes:
   - Vite (React/Vue/Svelte/etc.): `npm create vite@latest`
   - Angular: `npx @angular/cli new <name> --standalone --style=scss`
   - Nx: `npx create-nx-workspace@latest`
   - Next.js: `npx create-next-app@latest`
   - SvelteKit: `npm create svelte@latest`
   - Astro: `npm create astro@latest`
   - NestJS: `npx @nestjs/cli new <name>`
   - .NET: `dotnet new <template>`
   - FastAPI / Django / Rails / Phoenix / Go: stack-standard CLI
3. **Initial commit immediately** — your "known-good" rollback point:
   ```bash
   git add -A
   git commit -m "chore: scaffold project with <stack-cli>"
   ```
4. Optional but highly recommended: **let the agent run the scaffold for you** — it's good practice for supervised tool use. Approve the command, watch the output, then commit.

> **Why git matters now:** Claude Code is a CLI tool. There is no GUI undo button. `git diff` is your review surface; `git restore .` and `git reset --hard <previous-commit>` are your rollback. Every later phase ends with a commit so each step is independently reviewable and undoable.

### Phase 2 — Bootstrap context with `AGENTS.md` (25 min)

1. In Claude Code, run `/init` to generate a starting `CLAUDE.md`.
2. Rename it to `AGENTS.md` for portability (Claude Code reads either; AGENTS.md is the cross-tool standard).
3. **Have the agent expand it** (Block 4 pattern — the agent writes context under your supervision):

   **Switch to Plan mode (`Shift+Tab`) and prompt:**
   > Read this codebase. Then propose an expanded `AGENTS.md` covering:
   > 1. **Project information** — what this app is, the stack, how to run/test/build, where the entry points are.
   > 2. **Architectural guidance** — folder structure, module boundaries, state management approach, data flow.
   > 3. **Coding style guidance** — 5–8 concrete actionable rules tied to *this* project's conventions, not generic clean-code advice.
   > 4. **Version control & commit conventions** — instruct the agent to suggest Conventional Commits at coherent checkpoints, never amend accepted commits, never run destructive git operations without confirmation, suggest stash/commit before non-trivial tasks if working tree is dirty.
   > 5. **Pointers to the guideline files** I'm about to create (`docs/ARCHITECTURE.md`, `docs/guidelines/*.md`) — even if they don't exist yet, link to them so future-you remembers to write them.
   >
   > Before drafting, list any uncertainties or unstated decisions and ask me about them.

4. Answer the agent's questions. Refine the proposal. Exit Plan mode and have the agent write `AGENTS.md`.
5. **Commit:** `git add AGENTS.md && git commit -m "docs: bootstrap AGENTS.md"`

### Phase 3 — Create `docs/` structure (30 min)

1. **Switch to Plan mode** and prompt:
   > Read this scaffolded codebase. Propose:
   > - `docs/ARCHITECTURE.md` describing the structure, app/lib boundaries, data flow.
   > - `docs/guidelines/<LANGUAGE>.md` with language-level conventions (types, null handling, error patterns, module style).
   > - `docs/guidelines/<FRAMEWORK>.md` with framework conventions (components, state, routing, etc.).
   > - `docs/guidelines/STYLING.md` (or similar, if the project has a UI).
   >
   > Before drafting, list anything ambiguous and ask me. Don't invent conventions the project doesn't actually use — read the scaffolded code and infer.

2. Review the proposals one by one. Push back where the agent over-generalizes.
3. Exit Plan mode and have the agent write the files.
4. Update `AGENTS.md` so it links to the new docs explicitly (the agent can do this in the same turn).
5. **Commit:** `git add docs/ AGENTS.md && git commit -m "docs: add architecture + guidelines"`

### Phase 4 — Initialize OpenSpec (10 min)

```bash
npm install -g @fission-ai/openspec@latest      # if not already installed
openspec init
```

1. Inspect what was created: the new `openspec/` folder, updates to `AGENTS.md` / `CLAUDE.md`, the new slash commands available in Claude Code (`/opsx:propose`, `/opsx:apply`, `/opsx:archive` — type `/` to verify).
2. **Commit:** `git add . && git commit -m "chore: initialize OpenSpec"`

### Phase 5 — Optional: enable a stack-relevant MCP (10 min)

Pick **at most one** — intentional composition, not maximalism. Snippets are in [`mcp-snippets/`](../mcp-snippets/) at the umbrella root.

- **Frontend stack on a fast-moving framework?** Add **Context7** — current version-specific docs in the agent's context.
- **UI you'll want to debug visually?** Add **Chrome DevTools-MCP** — agent reads the DOM, console errors, network tab.
- **Large codebase already?** Add **Codanna** — semantic search + symbol graph (overkill for a fresh project; defer until you have ~thousands of files).

Add the MCP entry to `.mcp.json` at the project root and commit it so future-you (and any teammate) gets the same setup.

### Voice check-in just before lunch (5 min)

Facilitator picks 2–3 participants by voice. *"Show your AGENTS.md and `docs/` structure. What did the agent get right? What did you push back on?"* Quick — lunch is a hard deadline.

> **Status check-ins** at the 30 / 60 / 90 min marks go into the workshop Google Doc → *Block 8 → Harness Status Check-Ins* table. Lets the facilitator scan everyone's progress without scrolling chat. Use short codes: `scaffold done`, `AGENTS.md drafted`, `docs/ in progress`, `openspec init done`.

---

## Lunch (1:00)

---

## Part 2 (after lunch, 1:30) — Spec, implement, iterate

### Quick re-sync (5 min, voice)

Anyone whose harness setup didn't fully complete before lunch — what's the gap? Co-facilitator pairs up with you to catch you up while the rest move into specs.

### Phase 6 — Propose & refine the first slice with OpenSpec (30 min)

1. Pick the **smallest meaningful first slice** — not "the whole app." Examples:
   - Meal planner → "create the recipe model + a CRUD UI for recipes"
   - Bookmark manager → "save a URL with a title, list saved URLs"
   - Habit tracker → "create habits, mark today done, see today's list"

2. Run `/opsx:propose <slice-name>` and let OpenSpec generate the change folder under `openspec/changes/<slice-name>/`.

3. **Review every artifact in order**, using the OpenSpec proposal review checklist from Block 7:
   - `proposal.md` — Is the motivation clear? Are non-goals stated?
   - `specs/*` — Are acceptance criteria testable? Are edge cases included?
   - `design.md` — Does it match conventions from `docs/guidelines/*`? Is the data model aligned with existing patterns?
   - `tasks.md` — Are tasks atomic? Ordered? Do migrations / seed data come first?

4. **Push back on the agent**. Common pushbacks:
   - "The proposal doesn't say what happens when X — add that to the specs."
   - "design.md picked an enum but the project pattern is a status table — fix that."
   - "tasks.md is missing the migration step / the test step / the seed step."
   - "Acceptance criteria for X are vague — make them testable."

5. Have the agent update artifacts in place. Re-read until **you'd be comfortable handing the spec to an unsupervised junior**. *This is the moment most participants under-invest in.* Keep refining.

### Phase 7 — `/opsx:apply` with active supervision (35 min)

1. Run `/opsx:apply`. The agent works through `tasks.md` task by task.
2. **Review each diff as it lands** (Block 3 supervision discipline). Catch drift between spec and implementation early — refine the spec or steer the agent rather than fixing at the code level.
3. **Watch for the four vibe-coding patterns from Block 3** — easier to spot now that the agent is working in your own codebase, on your own conventions:
   - Code repetition
   - Local helpers duplicating shared ones
   - Outdated APIs / patterns
   - Consistency drift (naming, error handling, file structure)
4. **Keep a misbehavior tally** in a scratch file. This is the raw material for Phase 8 — don't skip it. Examples:
   - "Forgot the naming convention again (3rd time)"
   - "Kept asking where to put new components"
   - "Reached for `useState` when our pattern is signals"
   - "Swallowed errors with try/catch instead of returning a result"
5. **Commit after each task in `tasks.md` that lands cleanly.** Your `AGENTS.md` should already instruct the agent to suggest commits at coherent checkpoints.
6. Run the project and exercise the slice (browser / CLI / tests / whatever fits the stack).
7. **If the agent introduces a regression**, stop and **self-review with a fresh agent session**: spin up a new Claude Code chat with no history, point it at the diff (`git diff <last-good-commit>..HEAD`), and ask it to review against your `AGENTS.md` and the OpenSpec spec. Fresh context = independent review — the remote-friendly substitute for asking a colleague to look over your shoulder.

> Don't expect to *finish* the slice in 35 minutes. The goal is to **experience the apply loop** with active supervision, not ship the feature. Stop when the time runs out.

### Phase 8 — Evolve your harness (5 min) — **the key learning beat**

A harness is **never finished; it evolves with the project**. After 35 minutes of active supervision, your tally has at least one or two repeated agent behaviors. Those repetitions are signal: they're exactly what `AGENTS.md`, a sharper guideline, or a future skill would have prevented.

1. **Look at your misbehavior tally**. Pick the **one** most frequent or most painful pattern. *One, not all of them.* The discipline of "what's the highest-leverage single fix" is itself the lesson.

2. **Translate it into a concrete harness improvement** — write the actual change, don't just describe it:
   - **A new rule in `AGENTS.md`** — e.g. *"Always `import type` for type-only imports"*, *"Components live in `src/features/<feature>/components/`, never at the feature root."*
   - **A sharpened guideline** — extending `docs/guidelines/<framework>.md` with the missing convention, or adding a "common mistakes to avoid" subsection.
   - **A note for a future skill** — anything you typed three times during apply is a candidate for `.claude/commands/`. You'll learn how to build one in Block 9; for now, just write down the candidate.
   - **A spec refinement note** — anything that *should* have been in `tasks.md` or `proposal.md` from the start.

3. **If you have any remaining time**, either skim a `/opsx:propose <next-slice>` to confirm the loop scales, or apply your one harness improvement and re-run a small piece of work to feel the difference.

4. **Stop on time.** The debrief is more valuable than another five minutes of typing. The harness improvement you wrote down goes home with you and gets applied to your real projects on Monday.

### Plenary debrief (15 min, voice-led)

- **First 10 min — volunteer screen-shares** (3 participants × ~3 min): each volunteer briefly walks through their harness, their spec, **one** diff that surprised them, **one** moment where supervision made a clear difference, and **the one harness improvement** they wrote down in Phase 8.
- **Last 5 min — open round + written takeaways:** facilitator opens the floor — *"Where did your harness make things easier than you expected? Where did the agent still drift, even with everything in place? What was the one harness improvement you'd add tomorrow morning?"* Everyone (including those who didn't speak) adds one line *and* their Phase 8 harness improvement to the workshop Google Doc → *Block 8 → Build-Your-Own Takeaways*.

---

## Outcome

You leave Block 8 with:

- A **working repo, in your own stack, with your own harness end-to-end**: AGENTS.md, layered `docs/`, OpenSpec initialized, at least one spec'd-and-applied feature slice
- A **misbehavior tally** of things the agent did that you didn't want
- **At least one concrete harness improvement** you translated those observations into
- A real felt sense of how the pieces fit together
- A reflex for how to keep evolving the harness after Monday

> A harness is a living artifact. The discipline of *converting observed misbehavior into a context-engineering fix* is what separates a junior supervisor from a senior one.

---

## Quick reference — phase time-boxes

| Phase | Length | What |
|-------|--------|------|
| Framing recap | 15 min | Presentation |
| Choose project | 10 min | Pick stack + idea + first slice; roster |
| 1 — Scaffold + git baseline | 15 min | `git init` first, then scaffold, initial commit |
| 2 — Bootstrap `AGENTS.md` | 25 min | `/init` → rename → expand under supervision |
| 3 — `docs/` structure | 30 min | ARCHITECTURE + guidelines, agent writes |
| 4 — `openspec init` | 10 min | Verify slash commands, commit |
| 5 — Optional MCP | 10 min | At most one |
| Voice check-in | 5 min | 2–3 share AGENTS.md + docs |
| **Lunch** | 60 min | |
| Re-sync | 5 min | Catch up stragglers |
| 6 — `/opsx:propose` + refine | 30 min | Push back until you'd hand it to a junior |
| 7 — `/opsx:apply` + supervision | 35 min | Diff every task, keep misbehavior tally |
| 8 — Evolve your harness | 5 min | Translate one tally item into a fix |
| Plenary debrief | 15 min | 3 share-outs + open round |

**Total Part 1:** 2:00 (10:05–12:05). **Lunch:** 1:00 (12:05–13:05). **Total Part 2:** 1:30 (13:05–14:35).
