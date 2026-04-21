# Reference skill — `/conventional-commit`

> **What this is:** the "what good looks like" reference for the `/conventional-commit` skill participants build in Block 9. Compare your own version against this *after* you've built yours — don't peek beforehand. The point of the exercise is iterating on a skill prompt, not copy-pasting one.
>
> **Where it lives in a real project:** `.claude/commands/conventional-commit.md` (project-scoped) or `~/.claude/commands/conventional-commit.md` (user-global). Once present, type `/conventional-commit` in Claude Code to invoke it.

---

## File contents

Everything between the `BEGIN conventional-commit.md` and `END conventional-commit.md` markers below is the entire `.claude/commands/conventional-commit.md` file, verbatim. The frontmatter is what Claude Code reads to expose the slash command; everything below the second `---` is the prompt the agent runs.

> The content is not wrapped in a markdown code fence on purpose — the file *is* markdown and contains its own fenced code blocks, so a single outer fence would be closed prematurely by the inner ones. Read this file as raw text (or in your editor) when copying.

<!-- ===================== BEGIN conventional-commit.md ===================== -->

---
description: Generate a Conventional Commits message for the current staged diff
allowed-tools:
  - Bash(git diff:*)
  - Bash(git diff --staged:*)
  - Bash(git status:*)
  - Bash(git log:*)
argument-hint: "[optional scope hint, e.g. 'auth' or 'parser']"
---

You are generating a **Conventional Commits**-formatted commit message for the changes the user has staged. Follow the spec at https://www.conventionalcommits.org/ strictly.

## Step 1 — Read the staged diff

Run `git diff --staged` and `git status --short` to see exactly what is staged. **Do not include unstaged changes** — only what's in the index.

If the staged diff is empty, stop and tell the user: *"Nothing is staged. Stage your changes first (`git add ...`) and try again."*

If $ARGUMENTS is provided, treat it as a strong hint about the **scope** (e.g. `auth`, `parser`, `ui`). Honor it unless the diff makes it obviously wrong.

## Step 2 — Pick the type

Pick the **single most appropriate** type for the dominant change:

| Type | When |
|------|------|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `refactor` | Internal restructure with no behavior change |
| `perf` | Performance improvement |
| `docs` | Documentation only |
| `test` | Tests only (or test infrastructure) |
| `build` | Build system / dependencies |
| `ci` | CI configuration |
| `chore` | Anything that doesn't fit the above (rename a config key, bump a generated file) |
| `style` | Code formatting only — never used for behavior changes |
| `revert` | Reverting a previous commit |

If the diff genuinely spans multiple types, prefer `refactor` for mixed maintenance and ask the user (in your response, before writing the message) whether they'd like you to split the staged changes into smaller commits.

## Step 3 — Pick a scope (optional but encouraged)

Look at the staged file paths. If they cluster cleanly under one area (`src/auth/**`, `apps/api/**`, a single feature folder, a single library), use that as the scope in parens after the type: `feat(auth):`, `fix(api):`. If the diff is genuinely cross-cutting, omit the scope.

## Step 4 — Write the subject line

- **Maximum 72 characters** including the type, scope, colon, and space. Hard limit.
- **Imperative mood** — *"add support for X"*, not *"added"* or *"adds"*.
- **No trailing period.**
- Lowercase first word after the colon (unless it's a proper noun).
- Be concrete. *"fix(parser): handle empty input"* beats *"fix(parser): bug fix"*.

## Step 5 — Write the body (only when needed)

Skip the body for trivial commits (typos, single-line fixes, obvious renames). For non-trivial changes, add a blank line after the subject, then a body that answers:

1. **Why** the change was made (the motivation, not the diff)
2. **What** notable trade-offs or decisions were made
3. **What** the user / caller should know that isn't obvious from the diff

Wrap body lines at 72 chars. Use bullet points (`- `) when listing.

## Step 6 — Footers (only when applicable)

- **`BREAKING CHANGE: <description>`** — if the change breaks a public API. Triggers a major-version bump under semver.
- **`Refs: #123`** / **`Fixes: #123`** / **`Closes: #123`** — if the user mentioned an issue ID, or if you can infer one from the branch name or recent `git log`.
- Other trailers (`Co-authored-by:`, `Reviewed-by:`) only if the user mentioned them.

## Step 7 — Output

Output **only the commit message**, in a single ```` ``` ```` code block, with no preamble and no commentary. The user wants to copy-paste it into `git commit -F -` or into a commit-message editor.

If you had to make a non-obvious decision (split into multiple commits suggestion, ambiguous scope, breaking-change ambiguity), put a **single short sentence** *after* the code block to flag it. Don't ramble.

## Examples

Good:

```
feat(auth): add password-reset flow

Adds the /auth/reset endpoint and the matching email template. Reuses
the existing token-issuer; tokens expire in 30 minutes.
```

Good (trivial — no body):

```
fix(parser): handle empty input
```

Good (breaking):

```
refactor(api)!: rename `userId` to `user_id` in all responses

BREAKING CHANGE: clients consuming `userId` from any /api/v1 endpoint
must update to read `user_id`. The change is consistent across
projects, posts, and comments resources.
```

Bad (avoid):

- `chore: stuff` — not specific
- `feat: Added new feature for users` — past tense, vague, capital A
- `fix: this fixes the bug where the parser would crash when the input was empty` — runs over 72 chars, redundant phrasing

<!-- ====================== END conventional-commit.md ====================== -->

---

## Notes for the workshop

- The `allowed-tools` frontmatter constrains what the agent can do — only git read commands, never anything that mutates state. This is the same constraint pattern used in subagents (see `security-reviewer.md` for the equivalent applied to a reviewer role).
- `$ARGUMENTS` (the scope hint) is the only argument the skill takes — anything else the user wants to communicate goes in the prompt or as a follow-up.
- Real teams often add a few extra rules tied to their process: "always link the Jira ticket from the branch name in a `Refs:` footer", "use `feat(api)!:` for API breaking changes even before v1.0", "wrap body at 72 chars but allow URLs to overflow". Those are exactly the kind of rules a skill is designed to encode.
- If you want a more aggressive variant (auto-stages, auto-commits, auto-pushes), build it as `/conventional-commit-and-push` — separate skill, more permissions in `allowed-tools`, but **only if your AGENTS.md says destructive git ops are pre-approved on this project**. Most teams should keep this skill read-only and have the human run `git commit -F -` themselves.
