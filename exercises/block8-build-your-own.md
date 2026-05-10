# Block 8 — Build Your Own (Harness Setup Procedure)

> **3:30 spanning lunch.** Day 2's biggest hands-on block. You assemble the **AI agent harness** you've been building piece by piece across Blocks 1–7 and apply it to a project of *your* choosing — your stack, your app idea, your conventions.

By Block 7 you have all the building blocks: supervision discipline (Block 3), context engineering (Blocks 4 & 6), MCPs (Block 5), spec frameworks (Block 7). Using them on a pre-built workshop codebase has diminishing returns. The most valuable thing now is **assembling the full harness on a project you actually care about**, so the patterns transfer to your day-to-day work after the workshop.

---

## What "harness" means here

The **AI agent harness** is the complete operating environment around the model:

| Layer | What you choose | Block where we built it |
|-------|-----------------|-------------------------|
| Tool & model | Claude Code → MiniMax-M2.7-highspeed | Block 2 |
| Supervision discipline | Research → Plan → Execute → Review | Blocks 3 & 7 |
| Context layer | `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/guidelines/*.md` | Blocks 4 & 6 |
| Tool extensions | MCP servers (Codanna, Chrome DevTools, Context7) | Block 5 |
| Spec layer | OpenSpec | Block 7 |

The model alone is one component. The harness is what turns a smart model into a productive collaborator — and a *bad* harness is why the same model produces sloppy code in one project and great code in another.

> **Day 2 expands the loop.** Block 3's *Plan → Execute → Review* is the right shape for any change. For brownfield work — anything where the existing code, dependencies, internal APIs, or conventions matter — prepend a real **Research** phase and the loop becomes *Research → Plan → Execute → Review*. This block practices the full cascade: research for *your own* slice produces a `research.md`, the spec is built against the research, the implementation is supervised against the spec, and the review checks all three. A small mistake in research can torpedo a perfect plan and a flawless implementation; the cost of fixing one is paid in the layers below.

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

### Phase 2 — Bootstrap context with `CLAUDE.md` (25 min)

1. In Claude Code, run `/init` to generate a starting `CLAUDE.md`. Claude Code reads `CLAUDE.md` natively — no rename, no symlink.
2. **Have the agent expand it** (Block 4 pattern — the agent writes context under your supervision):

   **Switch to Plan mode (`Shift+Tab`) and prompt:**
   > Read this codebase. Then propose an expanded `CLAUDE.md` covering:
   > 1. **Project information** — what this app is, the stack, how to run/test/build, where the entry points are.
   > 2. **Architectural guidance** — folder structure, module boundaries, state management approach, data flow.
   > 3. **Coding style guidance** — 5–8 concrete actionable rules tied to *this* project's conventions, not generic clean-code advice.
   > 4. **Version control & commit conventions** — instruct the agent to suggest Conventional Commits at coherent checkpoints, never amend accepted commits, never run destructive git operations without confirmation, suggest stash/commit before non-trivial tasks if working tree is dirty.
   > 5. **Pointers to the guideline files** I'm about to create (`docs/ARCHITECTURE.md`, `docs/guidelines/*.md`) — even if they don't exist yet, link to them so future-you remembers to write them.
   >
   > Before drafting, list any uncertainties or unstated decisions and ask me about them.

3. Answer the agent's questions. Refine the proposal. Exit Plan mode and have the agent write `CLAUDE.md`.
4. **Commit:** `git add CLAUDE.md && git commit -m "docs: bootstrap CLAUDE.md"`

> **Cross-tool footnote.** If your project also needs `AGENTS.md` for Cursor / Open Code / Cline / Aider, either symlink (`ln -s AGENTS.md CLAUDE.md`) or write the rules in `AGENTS.md` and put `@AGENTS.md` at the top of `CLAUDE.md` so Claude Code imports them. See [code.claude.com/docs/en/memory#agents-md](https://code.claude.com/docs/en/memory#agents-md). The workshop sticks with plain `CLAUDE.md` to keep the cognitive load on supervision, not file plumbing.

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
4. Update `CLAUDE.md` so it links to the new docs explicitly (the agent can do this in the same turn).
5. **Commit:** `git add docs/ CLAUDE.md && git commit -m "docs: add architecture + guidelines"`

### Phase 4 — Initialize OpenSpec (10 min)

```bash
npm install -g @fission-ai/openspec@latest      # if not already installed
openspec init
```

1. Inspect what was created: the new `openspec/` folder, updates to `CLAUDE.md`, the new slash commands available in Claude Code (`/opsx:propose`, `/opsx:apply`, `/opsx:archive` — type `/` to verify).
2. **Commit:** `git add . && git commit -m "chore: initialize OpenSpec"`

### Phase 5 — Optional: enable a stack-relevant MCP (10 min)

Pick **at most one** — intentional composition, not maximalism. Snippets are in [`mcp-snippets/`](../mcp-snippets/) at the umbrella root.

- **Frontend stack on a fast-moving framework?** Add **Context7** — current version-specific docs in the agent's context.
- **UI you'll want to debug visually?** Add **Chrome DevTools-MCP** — agent reads the DOM, console errors, network tab.
- **Large codebase already?** Add **Codanna** — semantic search + symbol graph (overkill for a fresh project; defer until you have ~thousands of files).

Add the MCP entry to `.mcp.json` at the project root and commit it so future-you (and any teammate) gets the same setup.

### Voice check-in just before lunch (5 min)

Facilitator picks 2–3 participants by voice. *"Show your CLAUDE.md and `docs/` structure. What did the agent get right? What did you push back on?"* Quick — lunch is a hard deadline.

> **Status check-ins** at the 30 / 60 / 90 min marks go into the workshop Google Doc → *Block 8 → Harness Status Check-Ins* table. Lets the facilitator scan everyone's progress without scrolling chat. Use short codes: `scaffold done`, `CLAUDE.md drafted`, `docs/ in progress`, `openspec init done`.

---

## Lunch (1:00)

---

## Part 2 (after lunch, 1:30) — Research, spec, implement, iterate

### Quick re-sync (5 min, voice)

Anyone whose harness setup didn't fully complete before lunch — what's the gap? Co-facilitator pairs up with you to catch you up while the rest move into research.

### Phase 6 — Research the first slice (20 min) — **new in the 9-phase procedure**

The fastest way to ruin a perfect spec is to build it on a fuzzy understanding of where the change has to fit. *Research → Plan → Execute → Review*: the closer you can get to the truth before the spec is written, the less drift you'll fight in the implementation.

1. **Pick the smallest meaningful first slice** — same scope discipline as before. Examples:
   - Meal planner → "create the recipe model + a CRUD UI for recipes"
   - Bookmark manager → "save a URL with a title, list saved URLs"
   - Habit tracker → "create habits, mark today done, see today's list"

2. **Do real research before any spec exists.** Go after the truth, not your memory of it:
   - **Web research:** official docs for the libraries the slice will touch (verify version-specific APIs — *what does the dependency actually do today*).
   - **Existing code:** if the slice extends or interacts with code already in the repo, read those files yourself and have the agent summarize anything large you can't read end-to-end.
   - **Internal APIs:** if the slice depends on contracts another team owns, gather the actual current shape, error modes, rate limits.
   - **External constraints:** deadlines, compatibility windows, security / compliance requirements, anything that bounds the design.
   - **Open questions:** the ones the spec must resolve. Naming them up front is half the work.

3. **Distill into a single compressed truth document at `docs/research/research-for-<slice-name>.md`.** That location is intentional: the OpenSpec change folder (`openspec/changes/<slice-name>/`) doesn't exist yet — it gets created in Phase 7 when you run `/opsx:propose`. Keeping research outside OpenSpec also means it survives the change being archived and stays available as reference for future related work. Keep it short and reviewable — the goal isn't a wiki, it's the smallest set of facts the spec stands on.

4. **Use Plan mode to draft it under your supervision** — same agent-writes-you-supervise pattern as `CLAUDE.md` and the docs. Push back on anything the agent invents instead of verifying.

5. **Stop when** you'd be embarrassed for the planner to surprise you with a question this should have answered. **Commit:** `git add docs/research/ && git commit -m "docs(research): notes for <slice>"`.

> **Why a real hour-ish budget here in the wild.** Twenty minutes is the workshop budget. In real-world brownfield work, an hour or two is normal for a non-trivial slice — and that hour pays back many times over downstream. A small mistake in research can torpedo a perfect spec and a flawless implementation; the cost of fixing it is paid in the layers below.

### Phase 7 — Propose & refine the spec on top of research (20 min)

1. Run `/opsx:propose <slice-name>` and **point the agent at the research document** — *"Build the proposal against `docs/research/research-for-<slice-name>.md`; don't introduce assumptions the research doesn't support."* Let OpenSpec generate the change folder under `openspec/changes/<slice-name>/`.

2. **Review every artifact in order against the research**, using the OpenSpec proposal review checklist from Block 7:
   - `proposal.md` — Is the motivation clear? Are non-goals stated? Does it match the constraints in `docs/research/research-for-<slice-name>.md`?
   - `specs/*` — Are acceptance criteria testable? Are the edge cases the research surfaced included?
   - `design.md` — Does it match conventions from `docs/guidelines/*`? Is the data model aligned with the existing patterns the research called out?
   - `tasks.md` — Are tasks atomic? Ordered? Do migrations / seed data come first?

3. **Push back at the right layer.** This is the most important habit in the whole block:
   - If the proposal contradicts `research.md`, ask whether the *research* is wrong (in which case fix the research first, then re-propose) or whether the *proposal* drifted (push back on the spec).
   - Common spec-level pushbacks: "design.md picked an enum but the project pattern is a status table — fix that"; "tasks.md is missing the migration / test / seed step"; "acceptance criteria for X are vague — make them testable."
   - **Never let the spec drift away from the research silently.** Every divergence is a parallel truth that costs you in implementation.

4. Have the agent update artifacts in place. Re-read until **you'd be comfortable handing the package to an unsupervised junior**. *This is the moment most participants under-invest in.* Keep refining.

### Phase 8 — `/opsx:apply` with active supervision (30 min)

1. Run `/opsx:apply`. The agent works through `tasks.md` task by task.
2. **Review each diff as it lands** (Block 3 supervision discipline). Catch drift early — *fix at the source layer, not at the code*:
   - **Code drifting from spec?** Steer at the spec layer — refine `tasks.md` or `design.md`, then continue.
   - **Spec drifting from research?** Stop. Fix the research, redo the spec, then continue. Don't paper over it in code.
   - Steering implementation away from the higher-level artifacts creates parallel truths and compounding debt. Cheap rule: if the fix lives at a higher layer, do it there first, every time.
3. **Watch for the four vibe-coding patterns from Block 3** — easier to spot now that the agent is working in your own codebase, on your own conventions:
   - Code repetition
   - Local helpers duplicating shared ones
   - Outdated APIs / patterns
   - Consistency drift (naming, error handling, file structure)
4. **Manage your context.** If the session is sliding into the dumb zone (`/context` over ~40%, or you've layered correction on correction), stop, write a quick summary of the good parts, start a fresh Claude Code session with that summary plus the spec / research as priming, and continue. Forced reset > pushing through.
5. **Keep a misbehavior tally** in a scratch file. This is the raw material for Phase 9 — don't skip it. Examples:
   - "Forgot the naming convention again (3rd time)"
   - "Kept asking where to put new components"
   - "Reached for `useState` when our pattern is signals"
   - "Swallowed errors with try/catch instead of returning a result"
6. **Commit after each task in `tasks.md` that lands cleanly.** Your `CLAUDE.md` should already instruct the agent to suggest commits at coherent checkpoints.
7. Run the project and exercise the slice (browser / CLI / tests / whatever fits the stack).
8. **If the agent introduces a regression**, stop and **self-review with a fresh agent session**: spin up a new Claude Code chat with no history, point it at the diff (`git diff <last-good-commit>..HEAD`), and ask it to review against your `CLAUDE.md`, the spec, *and* the research doc. Fresh context = independent review — the remote-friendly substitute for asking a colleague to look over your shoulder.

> Don't expect to *finish* the slice in 30 minutes. The goal is to **experience the full Research → Plan → Execute → Review cascade** with active supervision, not ship the feature. Stop when the time runs out.

### Phase 9 — Evolve your harness (5 min) — **the key learning beat**

A harness is **never finished; it evolves with the project**. After 30 minutes of active supervision, your tally has at least one or two repeated agent behaviors. Those repetitions are signal: they're exactly what `CLAUDE.md`, a sharper guideline, the research template, or a future skill would have prevented.

1. **Look at your misbehavior tally**. Pick the **one** most frequent or most painful pattern. *One, not all of them.* The discipline of "what's the highest-leverage single fix" is itself the lesson.

2. **Translate it into a concrete harness improvement** — write the actual change, don't just describe it:
   - **A new rule in `CLAUDE.md`** — e.g. *"Always `import type` for type-only imports"*, *"Components live in `src/features/<feature>/components/`, never at the feature root."*
   - **A sharpened guideline** — extending `docs/guidelines/<framework>.md` with the missing convention, or adding a "common mistakes to avoid" subsection.
   - **A research-template note** — *"next time the slice touches X, also capture Y up front"* — turn the research phase into a repeatable artifact.
   - **A note for a future skill** — anything you typed three times during apply is a candidate for `.claude/commands/`. You'll learn how to build one in Block 9; for now, just write down the candidate.
   - **A spec refinement note** — anything that *should* have been in `tasks.md` or `proposal.md` from the start.

3. **If you have any remaining time**, either skim a `/opsx:propose <next-slice>` to confirm the loop scales, or apply your one harness improvement and re-run a small piece of work to feel the difference.

4. **Stop on time.** The debrief is more valuable than another five minutes of typing. The harness improvement you wrote down goes home with you and gets applied to your real projects on Monday.

### Plenary debrief (15 min, voice-led)

- **First 10 min — volunteer screen-shares** (3 participants × ~3 min): each volunteer briefly walks through their *research → spec → implementation* cascade, **one** diff that surprised them, **one** moment where supervision made a clear difference (especially: did fixing at a higher layer pay off?), and **the one harness improvement** they wrote down in Phase 9.
- **Last 5 min — open round + written takeaways:** facilitator opens the floor — *"Where did research catch something the spec or the code would have missed? Where did the agent still drift, even with everything in place? What was the one harness improvement you'd add tomorrow morning?"* Everyone (including those who didn't speak) adds one line *and* their Phase 9 harness improvement to the workshop Google Doc → *Block 8 → Build-Your-Own Takeaways*.

---

## Outcome

You leave Block 8 with:

- A **working repo, in your own stack, with your own harness end-to-end**: `CLAUDE.md`, layered `docs/`, OpenSpec initialized, a research document for your first slice, at least one spec'd-and-applied feature slice
- A **misbehavior tally** of things the agent did that you didn't want
- **At least one concrete harness improvement** you translated those observations into
- A real felt sense of the *Research → Plan → Execute → Review* cascade and how the layers reinforce each other
- A reflex for how to keep evolving the harness after Monday

> A harness is a living artifact. The discipline of *converting observed misbehavior into a context-engineering fix*, and of *fixing at the highest impacted layer first*, is what separates a junior supervisor from a senior one.

---

## Quick reference — phase time-boxes

| Phase | Length | What |
|-------|--------|------|
| Framing recap | 15 min | Presentation |
| Choose project | 10 min | Pick stack + idea + first slice; roster |
| 1 — Scaffold + git baseline | 15 min | `git init` first, then scaffold, initial commit |
| 2 — Bootstrap `CLAUDE.md` | 25 min | `/init`, expand under supervision (Claude Code reads it natively) |
| 3 — `docs/` structure | 30 min | ARCHITECTURE + guidelines, agent writes |
| 4 — `openspec init` | 10 min | Verify slash commands, commit |
| 5 — Optional MCP | 10 min | At most one |
| Voice check-in | 5 min | 2–3 share `CLAUDE.md` + docs |
| **Lunch** | 60 min | |
| Re-sync | 5 min | Catch up stragglers |
| 6 — Research the slice | 20 min | Web / code / API research → `research.md` |
| 7 — `/opsx:propose` against research | 20 min | Spec built on top of `research.md`; push back at the right layer |
| 8 — `/opsx:apply` with supervision | 30 min | Diff every task, fix at the source layer, keep misbehavior tally |
| 9 — Evolve your harness | 5 min | Translate one tally item into a fix |
| Plenary debrief | 15 min | 3 share-outs + open round |

**Total Part 1:** 2:00 (10:05–12:05). **Lunch:** 1:00 (12:05–13:05). **Total Part 2:** 1:30 (13:05–14:35).
