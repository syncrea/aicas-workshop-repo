# Block 4 — Context: AGENTS.md and a Tiny `docs/`

> **Block goal:** prove to yourself that a *short* context layer — one `AGENTS.md` and a couple of focused `docs/` files — beats relying on the model's defaults. You'll write the context yourself, then re-run the kind of task that went sideways in Block 3 and watch it go differently.

This Block builds directly on top of [Block 3](./EXERCISE-BLOCK-3.md) using the same contact-list codebase. Don't reset between blocks — the whole point is the *same* repo, *one* changed variable: the context you give the agent.

---

## Exercise 4.1 — The "build it yourself first" primer (10 min, facilitated)

> Goal: convince yourself, before doing any agent work, that the human still has to know what good looks like.

Brief facilitator-led discussion on:

- Why "the agent will figure out the conventions from the surrounding code" is mostly false at junior-model latency.
- Why writing `AGENTS.md` is itself a useful design exercise — it forces you to *name* your conventions.
- The difference between *prescriptive* context ("we use Result, not throws") and *encyclopedic* context ("here's our entire architecture diagram in markdown").

---

## Exercise 4.2 — Build a single `AGENTS.md` (45 min)

> Goal: produce one AGENTS.md file at the root of this lab that, on its own, would have prevented most of the Block 3 review findings.

### Step 1 — bootstrap with `/init` (5 min)

In this folder:

```bash
cd labs/block3-4-contact-list
claude
```

Run:

```
/init
```

Claude Code will scan the codebase and produce a `CLAUDE.md` with its first guess at the project's conventions. **Read it.** It's usually a reasonable structural skeleton (folder map, build commands, language/framework) and a deeply mediocre conventions section.

Rename it so future agents respect it regardless of tool:

```bash
mv CLAUDE.md AGENTS.md
```

(`AGENTS.md` is the cross-tool convention — Claude Code, Cursor, Codex CLI, and most other agentic tools read it. `CLAUDE.md` is Claude-specific only.)

### Step 2 — make it actually useful (30 min)

The default `/init` output covers Project Information well. Your job is to make the next three sections sharp enough that a contractor seeing this codebase for the first time could write code that fits in.

Edit `AGENTS.md` so it covers, in order:

#### 1. Project Information (often fine from `/init`)
What this app is, the stack at a glance, the scripts (`npm start`, `npm test`, `npm run build`), the folder map, where state lives.

#### 2. Architectural Guidance
Decisions a new contributor would otherwise have to reverse-engineer:

- "All persistent state lives in `ContactService` (signals + `localStorage`). No HTTP, no other stores."
- "`Result<T, E>` from `src/app/shared/utils/result.ts` is the canonical error pattern for service operations. Throw only for truly unexpected programmer errors."
- "Components consume sorted/derived data from `computed()` signals on the service — they don't sort or filter in the template or component class."
- "Route params reach components via `withComponentInputBinding()` and `input.required<string>()` — never `ActivatedRoute` snapshots."
- "Lazy-load every routed component."

#### 3. Coding Style Guidance
Don't reproduce ESLint here — describe the conventions a linter can't catch:

- "Standalone components only. No `NgModule`, no `standalone: false`."
- "Templates use `@if` / `@for`, never `*ngIf` / `*ngFor`."
- "Inline templates and inline styles, Tailwind utility classes."
- "Signals over RxJS for state. RxJS only for things that are genuinely streams (HTTP, websockets — neither of which exists here yet)."
- "DTO field names are camelCase across the whole app. Don't introduce snake_case for any new model."
- "Reach for shared helpers in `src/app/shared/utils/` (`formatRelativeDate`, `Result`) before inventing local ones."

#### 4. Version Control & Commit Conventions
Tell the agent how to commit:

- "Conventional Commits format. Scope is the area touched (e.g. `feat(contacts):`, `chore(contact-list):`)."
- "One feature per commit. Don't fold unrelated chores in."
- "Commit message body explains *why*, not *what* — the diff already shows what."

Look at `git log --oneline` for examples — the existing history (except the deliberately-bad `UNSUPERVISED AGENT OUTPUT` commit) is the model.

### Step 3 — peer-review (10 min)

Swap with another pair. Read each other's `AGENTS.md`. Argue about:

- What's vague enough that a junior model would still pick the wrong thing?
- What's so specific it'd block a sensible refactor later?
- What's missing? (Hint: did either of you write down the rule about Reactive Forms and `NonNullableFormBuilder`?)

Edit until both pairs are comfortable.

---

## Exercise 4.3 — Test the AGENTS.md (20 min)

> Goal: confirm the context actually changes what the agent produces. The diff is the test.

### Setup

If your tree is dirty from Block 3, commit or stash. Then revert the planted vibe-coded feature so you have somewhere clean to land the new version. The simplest way is `git revert` of the planted commit:

```bash
PLANTED=$(git log --grep="UNSUPERVISED AGENT OUTPUT" --format=%H | head -1)
git revert --no-edit "$PLANTED"
```

That cleanly undoes both the new `recently-viewed/` files and the wiring touches in `contact-list` and `contact-detail`, and leaves you with a revert commit explaining why.

### The task

Same prompt the unsupervised agent got. With your new `AGENTS.md` in place:

> Add a "recently viewed contacts" feature. Track the last five contacts the user opened on the detail page and show them in a small section under the main contact list.

Run in **Normal mode** so you can stop early. After the agent has made *one or two file edits*, pause and inspect them. Don't wait for the whole feature.

Score against your Block 3 review checklist:

- [ ] Did it use signals (not BehaviorSubject)?
- [ ] Did it create a standalone component (not NgModule)?
- [ ] Did it use `@if` / `@for` (not `*ngIf` / `*ngFor`)?
- [ ] Did it use camelCase fields (not snake_case)?
- [ ] Did it import `formatRelativeDate` from `src/app/shared/utils/date.ts` (not roll its own)?
- [ ] Did it return `Result` from any new service methods (not throw)?
- [ ] Did it sort in the service via a `computed`, not duplicate the sort in the component?

Whichever boxes are *not* ticked are the gaps in your AGENTS.md. Update it, throw the partial work away, and try again.

### Debrief (5 min)

Compare with the planted vibe-coded version. Same prompt, same model, the only difference is the context layer. How big was the gap?

---

## Exercise 4.4 — The 8 questions (10 min, facilitated)

> Goal: leave with a small mental checklist for evaluating any AGENTS.md, not just this one.

The facilitator presents the 8-question framework for evaluating context files (project info accuracy, architectural specificity, style enforceability, commit guidance, freshness, brevity, examples, anti-examples). Score your own AGENTS.md.

There is no perfect AGENTS.md. The goal is *good enough that the next agent run produces less work for you*, not perfection.

---

## Exercise 4.5 — Discussion (15 min)

Open conversation:

- Which AGENTS.md sections paid off most? Which felt like they did nothing?
- Where would `docs/` (one focused file at a time) have done better than another paragraph in AGENTS.md?
- What would you add if you knew you were about to onboard a *human* contractor next month?
- What's the smallest first AGENTS.md you'd write for one of your own real codebases?

---

## What you should walk out of Block 4 with

- One concrete `AGENTS.md` you wrote yourself, validated against a real (re-implementation) task.
- A felt sense for the marginal value of context: how much better the agent gets per line you add, and where the curve flattens.
- A starting point you can adapt for your own repo on Day 2 (Block 8 — Build Your Own Harness).

> **Stage 2's planned reference:** `references/AGENTS-EXAMPLE.md` in the umbrella repo will eventually contain a *fully-developed* AGENTS.md for this exact app, written by the workshop authors. **Don't peek at it before you've written your own** — it's the answer key, only useful as a comparison after you've done the work.
