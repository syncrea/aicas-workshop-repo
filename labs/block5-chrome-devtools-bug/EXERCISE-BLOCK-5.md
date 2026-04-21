# Block 5 — Chrome DevTools-MCP Hands-On (15 min)

> **Block goal:** experience the difference between debugging a UI bug *with* and *without* an agent that can see the rendered page. Most "agent can't find this bug" stories come down to the agent only seeing source code, not the runtime DOM. Chrome DevTools-MCP closes that gap.

This is **Part 2** of Block 5. Part 1 was the Codanna semantic-search round on the Angular monorepo (separate setup, see Block 5 in the workshop slides).

---

## Setup checklist (5 min)

Before the timer starts, every participant should have:

- [ ] `npm install` run in this folder (≈30 s after first time, near-instant on re-runs).
- [ ] The dev server running: `npm start` → http://localhost:4200/ open in **a Chrome window started with `--remote-debugging-port=9222`** (see [`README.md`](./README.md#1-launch-chrome-with-the-remote-debugging-port) for the exact incantation).
- [ ] Claude Code started **from inside this folder**: `cd labs/block5-chrome-devtools-bug && claude`.
- [ ] **Approved the project-scope MCP trust prompt** that appears the first time. If `/mcp` shows nothing, you missed it — run `claude mcp reset-project-choices` and restart `claude`.
- [ ] `/mcp` shows `chrome-devtools` in the list.
- [ ] (WSL / Linux only) the `.mcp.json` swap from `README.md` step 3 is done.

If any participant is stuck on setup, pair them up — don't wait. The exercise itself is short.

---

## The bug

Open the app at http://localhost:4200/. Fill in the form (any name, any message of 5+ characters). Click **Send feedback**.

What you should see: a green confirmation card below the form saying *"✅ Thanks {name}, we received your feedback."*

What you actually see: the form clears, no confirmation card. As a user, this looks broken — *"did my feedback go through?"*.

---

## Exercise 5.2 — Find and fix it (10 min)

> Goal: end up with a one-line CSS fix that took the agent ≤ 2 minutes once it could look at the rendered page.

### Step 1 — establish the baseline (2 min)

Without the agent, just by reading the source: how long does it take you to spot the cause?

Read these two files:
- `src/app/app.ts`
- `src/styles.css`

Most people see the bug after they read `styles.css`. **Don't fix it yet** — we want to compare. If you've already spotted it, pretend you haven't and move on.

### Step 2 — let the agent fix it via DevTools-MCP (5 min)

Reset the dev server's tab in your debugger Chrome window so the page is on `/`. In Claude Code (running from this folder), prompt:

```
The "Send feedback" button on http://localhost:4200/ doesn't appear to do
anything when clicked, even though the form clears. The success card
should show up but doesn't. Use the Chrome DevTools MCP to inspect the
page after a submit, identify the cause, and propose a one-line fix.
Don't grep the source first — start from the rendered page.
```

Watch what the agent does:

- It should call into the `chrome-devtools` MCP — taking a snapshot of the page, performing the click, taking another snapshot.
- It should notice that after the click, a `<div class="feedback-success ...">` IS in the DOM but is hidden.
- It should look at computed styles (or read `styles.css`) and trace the override.
- It should propose **either** removing the rule in `styles.css` **or** renaming the component class — both are acceptable fixes; the better one is removing the rule, since the class name comes from a real component and the rule was unambiguously dead code.

If the agent gets stuck on Chrome connectivity (no tabs, can't attach), pause and check that the Chrome you have open was launched with `--remote-debugging-port=9222`. That's the most common failure.

### Step 3 — apply the fix and verify (3 min)

Apply whichever fix the agent landed on. Reload http://localhost:4200/, submit the form, confirm the green card now appears.

Bonus 30-second exercise: ask the agent to take a screenshot of the now-fixed state via the MCP. Drop it in the chat as proof of life.

---

## Exercise 5.3 — Discussion (5 min)

Open conversation with the room:

- How much time did *Step 1* (source-only reading) take vs *Step 2* (agent + DevTools)? For most people it's a 5–10× difference, even on a tiny app — the gap grows non-linearly with codebase size.
- Where else does this pattern apply in your day-to-day work? Z-index battles, layout shifts on a specific viewport, console errors that don't bubble to the user, network calls that fail silently and leave the UI in a half-loaded state — all the same shape: **rendered state ≠ source state**, and the agent without browser eyes can't see it.
- Where is DevTools-MCP overkill? Pure backend logic, type errors, anything the LSP / compiler already surfaces. *"Visible in the rendered page but not in the source"* is the heuristic.
- What would change in your team's PR review process if every reviewer had this turned on?

---

## What you should walk out of Block 5 with

- A working `chrome-devtools` MCP setup you can carry to your own projects (the recipe in this lab's `README.md` transfers directly — it's the same `.mcp.json` shape regardless of project).
- A felt sense for **how much faster visual debugging gets when the agent can see the page**, and the corresponding rule of thumb: *if the bug is visible in the browser but not in the source, reach for DevTools-MCP first*.
- Combined with Part 1 (Codanna), a working pattern for the two MCP categories that pay off most of the time on real projects: **semantic code search** for navigating large codebases and **browser inspection** for visual / runtime bugs.
