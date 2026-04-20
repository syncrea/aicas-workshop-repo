# Block 8 — Project Ideas

> If you don't already have an idea for the Build Your Own lab (Block 8), pick one from below and **don't agonize** about it. The lab is about practising the harness, not shipping a product.

Each idea includes a **suggested first slice** small enough for the lab's `/opsx:propose → /opsx:apply` loop (Phases 6–7, ~65 min combined). The second slice — the one you might or might not get to — is your iteration target.

> Pick a stack you've used in the past month if at all possible. Block 8 isn't the moment to learn a new framework; it's the moment to feel the supervision loop on familiar ground.

---

## Web apps

### 1. Personal expense tracker

> Log expenses, categorise them, see a monthly summary.

- **First slice:** create an expense (amount, category, date, note); list expenses for the current month.
- **Second slice:** monthly total + per-category breakdown.
- **Suggested stack:** any web stack with a small DB — SvelteKit + SQLite, Next.js + SQLite, NestJS + Postgres, Django, Rails, Phoenix.

### 2. Bookmark manager with tags

> Save URLs with titles + tags; filter by tag.

- **First slice:** save a URL (auto-fetch the title if you can; manual entry if not), list all saved bookmarks.
- **Second slice:** add tags on save; filter the list by tag.
- **Suggested stack:** any web stack. Auto-title-fetch is a nice excuse to use the agent for an external HTTP call.

### 3. Habit tracker

> Track daily habits, mark them done, see streaks.

- **First slice:** create a habit; mark today as done; show today's habits with their done-state.
- **Second slice:** show a 7-day grid per habit; calculate current streak.
- **Suggested stack:** anything with persistence. Vanilla TS + IndexedDB is enough.

### 4. Recipe organiser

> Save recipes, search by ingredient, scale servings.

- **First slice:** create a recipe (name, servings, ingredients[], steps[]); list recipes; view one.
- **Second slice:** scale all ingredient quantities by a serving multiplier; full-text search by ingredient.
- **Suggested stack:** any with structured-data persistence. SvelteKit + SQLite, Next.js + Prisma, Rails.

### 5. Weekly meal planner

> Drag recipes onto days of the week, generate a shopping list.

- **First slice:** week grid (Mon–Sun) with a "lunch" and "dinner" slot per day; assign a recipe (from a hardcoded list of 5) to a slot.
- **Second slice:** generate a shopping list from the assigned recipes' ingredients (de-duplicate, sum quantities by unit).
- **Suggested stack:** SvelteKit, Next.js, Nuxt, anything UI-heavy.

### 6. Reading list with reading time estimates

> Save articles to read later; auto-estimate reading time; mark read/unread.

- **First slice:** save an article URL; estimate reading time (200 wpm × word count from a fetched article body); list unread.
- **Second slice:** mark read; filter unread/read; sort by reading time.
- **Suggested stack:** anything. Server-side fetch + parse is a good supervision exercise.

---

## CLI tools

### 7. Personal time tracker (CLI)

> `tt start <project>`, `tt stop`, `tt today`, `tt week` — track where your hours go.

- **First slice:** `tt start <project>` and `tt stop` write entries to a JSON/SQLite file; `tt today` prints today's entries with totals.
- **Second slice:** `tt week` prints a per-project breakdown for the last 7 days.
- **Suggested stack:** Node + commander/yargs, Python + typer, Go + cobra, Rust + clap. Pick whatever you'd ship a real CLI in.

### 8. Markdown notes vault CLI

> `notes new "Title"`, `notes search <query>`, `notes link a b` — a CLI on top of a folder of markdown files.

- **First slice:** `notes new "Title"` creates `<date>-<slug>.md` in `~/notes/`; `notes list` shows all notes by date.
- **Second slice:** `notes search <query>` does full-text search across all notes; `notes link a b` adds a `[[wikilink]]` from a to b.
- **Suggested stack:** any CLI stack. The "agent against a folder of markdown files" shape is exactly what coding agents are good at.

### 9. Git branch janitor (CLI)

> `branch-janitor list-stale`, `branch-janitor prune` — find and clean up merged / abandoned branches.

- **First slice:** `list-stale` prints local branches whose tip commit is older than N days and which are fully merged into `main`.
- **Second slice:** `prune` deletes the listed branches with confirmation; respects a `.branch-janitor-ignore` file.
- **Suggested stack:** Node, Python, or Bash + jq. Wraps `git for-each-ref` and friends.

---

## API-first

### 10. Personal URL shortener

> `POST /shorten` returns a short code; `GET /:code` redirects.

- **First slice:** `POST /shorten` (input URL), `GET /:code` (302 redirect), in-memory store first then SQLite.
- **Second slice:** `GET /:code/stats` returns hit count + last-hit time; basic per-IP rate limiting.
- **Suggested stack:** NestJS, FastAPI, Express, Spring Boot, Gin, Phoenix. Or full-stack if you want a tiny UI on top.

### 11. RSS-to-JSON proxy

> `GET /feed?url=<rss-url>` returns the parsed feed as clean JSON.

- **First slice:** fetch the RSS, parse to a normalised JSON shape (title, link, items[].{title,link,publishedAt,summary}); 30s in-memory cache.
- **Second slice:** support Atom in addition to RSS; persistent cache with TTL on disk; `?since=<iso-date>` filter.
- **Suggested stack:** any backend. Good supervision target — XML parsing has many gotchas the agent will get wrong without context.

### 12. Personal job-application tracker API

> Track which jobs you've applied to, statuses, follow-up dates.

- **First slice:** `POST /applications` (company, role, dateApplied, status), `GET /applications`, `PATCH /applications/:id`.
- **Second slice:** `GET /applications/needing-followup` (status='applied' AND dateApplied > 14 days ago); export to CSV.
- **Suggested stack:** NestJS + Postgres, FastAPI + SQLite, Spring Boot, .NET. Pick what your team uses.

---

## How to pick

Three filters, in order:

1. **Stack you can scaffold in your sleep.** This isn't the day to learn a new framework.
2. **Idea you'd actually use.** Even small motivation makes the supervision feel real.
3. **First slice that fits 65 min** of `/opsx:propose → /opsx:apply` time. If your gut says "no way I can ship that in an hour," it's too big — shrink it.

Add your choice to the workshop Google Doc → *Block 8 → Stack & Idea Roster* before Phase 1 starts.

---

## Adding your own ideas

If you have a small project of your own — something you've been meaning to start, an internal tool you'd like a prototype of, a bug you want to fix in your own existing repo — that's strictly better than anything on this list. Use that.

**One constraint:** if you're using an *existing* repo, work on a fresh branch and pick a new feature. The harness assembly steps (Phase 2 onward) assume there's no `AGENTS.md` yet, no `docs/guidelines/*` yet, no `openspec/` yet — so a greenfield branch on an existing repo works, but only if you're willing to add those files at the project root.
