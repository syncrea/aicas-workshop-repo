# My Team Integration Plan (Block 10)

> The point of this worksheet is to leave the workshop with **a concrete plan you can act on Monday morning** — not a polished document. Aim for *specific* over *comprehensive*.

You'll fill this in during the Block 10 individual exercise (30 min). Only a one-line summary of your **first action** goes into the shared workshop Google Doc — the full plan stays with you, since most of it is confidential to your team.

---

## 0 — Context

- **My team / org:** _____________________________________________________________
- **Team size:** ____      **My role:** _____________________________________________
- **Primary stack(s):** __________________________________________________________
- **Current AI usage in the team (be honest — "none / a few people use Copilot / everyone vibe-codes"):**

  > __________________________________________________________________

---

## 1 — Where to start (lowest-risk, highest-value first slice)

Pick **one** workflow to bring agentic supervision into first. Aim for something where the **upside is obvious** and the **blast radius is contained** if it goes wrong.

Common first-slice candidates:

- Generating tests for an existing module
- Drafting documentation (READMEs, API docs, CHANGELOG entries)
- Code review assistance on PRs (agent as a first reviewer, human as second)
- Bulk refactors / migrations (agent plans, scripts execute)
- Onboarding new engineers (agent as a "ask me about this codebase" surface)
- New feature scaffolding for greenfield work
- Spec-driven small features end-to-end (Block 7 pattern, on a contained module)

**My first slice:**

> __________________________________________________________________

**Why this one (one sentence):**

> __________________________________________________________________

**Blast radius if the agent gets it wrong:**

> __________________________________________________________________

---

## 2 — Context layer to build first

What context files does your codebase need before agents can be useful in your first slice? (Block 4 + Block 6 patterns.)

| File | Priority | Who writes it |
|------|----------|---------------|
| `AGENTS.md` (entry point) | ☐ must-have / ☐ nice-to-have | __________ |
| `docs/ARCHITECTURE.md` | ☐ must-have / ☐ nice-to-have | __________ |
| `docs/guidelines/<LANGUAGE>.md` | ☐ must-have / ☐ nice-to-have | __________ |
| `docs/guidelines/<FRAMEWORK>.md` | ☐ must-have / ☐ nice-to-have | __________ |
| `docs/guidelines/STYLING.md` (or VISUAL-STYLEGUIDE.md) | ☐ must-have / ☐ nice-to-have | __________ |
| Other: ________________________________________________ | ☐ must-have / ☐ nice-to-have | __________ |

**Order I'll create them in:** ___________________________________________

> Reminder from Block 4: **the agent writes these under your supervision** — you don't hand-author them. Then you refine.

---

## 3 — Skills and subagents to build first

From Block 9 — anything you (or your team) repeats more than twice is a candidate.

**Skills (`.claude/commands/`):**

| Skill | What it does | Frequency I'd use it |
|-------|--------------|----------------------|
| `/conventional-commit` | Generate Conventional Commits messages from staged diff | ⭐⭐⭐⭐⭐ |
| _____________________ | __________________________________ | _____ |
| _____________________ | __________________________________ | _____ |

**Subagents (`.claude/agents/`):**

| Subagent | Scope | When invoked |
|----------|-------|--------------|
| `security-reviewer` | Audit diffs for common vulns | Pre-merge, on demand |
| _________________ | __________________________ | _____________ |

---

## 4 — Guardrails

What needs to be in place so this doesn't go off the rails?

- [ ] **AGENTS.md / docs version-controlled** in the same repo as the code (not in a wiki)
- [ ] **Conventional commits + small commits enforced** (CI rule, pre-commit hook, or just team agreement)
- [ ] **PR template requires** the author to mark whether the PR contains AI-generated code, and confirm they reviewed every diff
- [ ] **Branch protection** on `main` — no direct pushes, even by agents
- [ ] **Linter / formatter / type-checker run on commit** (cheap automated review)
- [ ] **Test gate in CI** — agent-generated code must pass the same gate as human code
- [ ] **Security scan in CI** — SAST / dependency scan
- [ ] **Shared `.claude/` directory** committed to the repo so the whole team gets the same skills + subagents
- [ ] **Centralized config hub** for cross-repo conventions (Localsearch-style)
- [ ] **Off-limits zones** documented (paths the agent must never edit — secrets, generated code, vendored deps)
- [ ] Other: _________________________________________________________

---

## 5 — How I'll measure success at 30 / 90 days

**30 days (small signals):**

- [ ] At least N people on the team have AGENTS.md in their primary repo: ____
- [ ] At least N skills committed to the shared `.claude/commands/` directory: ____
- [ ] First slice (from Section 1) is in production / used regularly: ☐ yes ☐ no
- [ ] Other: ___________________________________________________

**90 days (real signals):**

- [ ] Cycle time on the workflow from Section 1: was ___ → now ___
- [ ] Team's qualitative read on AI-assisted PRs: better ☐ same ☐ worse ☐
- [ ] Number of "AI introduced this bug" incidents: ___
- [ ] We've evolved the harness based on real misbehavior tally: ☐ yes ☐ no
- [ ] Other: ___________________________________________________

> ⚠️ **Anti-metric:** "lines of code generated by AI per week." Don't measure this. It rewards the wrong thing.

---

## 6 — First three concrete actions (this week)

The single most important section. **Specific, small, dated.** "Talk to the team about AI" is not an action; "30-min meeting Tuesday with team-leads to agree on AGENTS.md authoring" is.

| # | Action | Owner | Date |
|---|--------|-------|------|
| 1 | _____________________________________________________________ | __________ | __________ |
| 2 | _____________________________________________________________ | __________ | __________ |
| 3 | _____________________________________________________________ | __________ | __________ |

---

## 7 — Risks and pre-mitigations

What could derail this in the first 30 days?

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Team resistance / "this is just hype" | L / M / H | _________________________________ |
| Security/compliance objections (data leaving the org) | L / M / H | _________________________________ |
| Token / subscription cost not approved | L / M / H | _________________________________ |
| Quality regression on first slice | L / M / H | _________________________________ |
| Vendor lock-in concern | L / M / H | _________________________________ |
| Other: _____________________________ | L / M / H | _________________________________ |

---

## 8 — One-line summary for the workshop Google Doc

This is the only line you'll share publicly (in the Block 10 → First Action Roster). Pick the **single most important first action** from Section 6:

> ____________________________________________________________________

---

*Date completed:* __________  
*Re-review on:* __________ (suggest: 30 days from today)
