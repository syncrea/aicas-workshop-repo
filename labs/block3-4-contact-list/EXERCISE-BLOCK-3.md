# Block 3 — Permissions, Modes, and Diff Review

> **Block goal:** internalise that *the supervisor — not the agent — owns the merge button.* You'll do that by deliberately running an unsupervised agent, reviewing what it shipped, and then practising the two interventions that catch the worst of it before it lands: **diff review** and **plan mode**.

This file is the participant procedure for Block 3, executed inside this lab folder. The facilitator runs the conceptual segments (≈30 min of slides + discussion) separately.

---

## Before you start

Confirm:

- [ ] You've completed [`setup/environment-setup.md`](../../setup/environment-setup.md)
- [ ] `claude` runs and connects to MiniMax-M2.7-highspeed
- [ ] `npm install && npm start` in this folder serves the app on http://localhost:4200/
- [ ] `git log --oneline` shows a commit titled `feat: add recently viewed contacts (UNSUPERVISED AGENT OUTPUT — REVIEW EXERCISE)` — that's your review surface for Exercise 3.2

You'll work in **pairs** for Exercises 3.2–3.4. Pair up now.

---

## Exercise 3.1 — The one safety surface (≈15 min, facilitated)

> Goal: agree on a working definition of "safe enough to let the agent run unattended" before the chaos starts.

The facilitator walks you through Claude Code's three permission modes (Normal, Auto-accept-edits, Plan), the `/permissions` command, and the conditions under which auto-accept is appropriate. The output of this segment is a shared rule of thumb your pair will use for the rest of the day.

Sketch your pair's rule here:

> When we'll let auto-accept-edits run unattended:
> _____________________________________________________________

> When we'll explicitly switch back to Normal mode:
> _____________________________________________________________

---

## Exercise 3.2 — Diff Review Sprint (40 min)

> Goal: practise reading an agent diff like a senior reviewer reads a junior PR. Spot the real problems fast.

### Setup

Make sure you're at the tip of `main`:

```bash
git log --oneline -10
```

You should see (among others) a commit titled `feat: add recently viewed contacts (UNSUPERVISED AGENT OUTPUT — REVIEW EXERCISE)`. That's the one you're reviewing. The commit immediately before it is the baseline you're comparing against.

Resolve both with these one-liners so you don't have to copy-paste hashes:

```bash
export PLANTED=$(git log --grep="UNSUPERVISED AGENT OUTPUT" --format=%H | head -1)
export BASELINE=$(git rev-parse "$PLANTED"^)
git log --oneline "$BASELINE^..$PLANTED"   # confirm: 2 commits, the baseline + the planted one
```

### The exercise (in pairs, 30 min)

1. Run the app first. Click into a few contacts. Confirm the "Recently viewed" section under the contact list updates as you click around. **The feature works.** That's the trap — passing the eye test isn't passing review.

2. Open the diff:

   ```bash
   git diff "$BASELINE..$PLANTED" -- labs/block3-4-contact-list/
   ```

   (Or use your IDE's git diff viewer — whatever lets you read it most easily.)

3. **Without the agent's help**, list every problem you find. Focus on:
   - Code repetition or duplicated logic
   - Re-implementing something that already exists in `src/app/shared/`
   - Use of patterns that don't match the rest of the codebase (look at the surrounding components and the service to see what "this codebase's way" is)
   - Field-naming, error-handling, or change-detection patterns that drift from the norm

4. Write your findings into a checklist. Aim for **at least four distinct categories** of problems. (There are at least four planted; some pairs may find more.)

5. For each finding, write a one-sentence "what good would have looked like" — i.e. what you'd ask the agent to do instead.

### Debrief (10 min, group)

Each pair shares its top finding. Facilitator collates the master list on the board. Discuss:
- Which findings were obvious vs. easy to miss?
- Which would have been caught by a build / typecheck / linter? (Spoiler: not many of them.)
- Which would have been caught if the agent had been told the convention up front? (Block 4 will fix this.)

---

## Exercise 3.3 — Intervene or Let It Run? (30 min)

> Goal: build the muscle for *deciding* mid-task whether to interrupt vs. let the agent finish. There is no universal right answer — the goal is conscious choice, not a rule.

### Setup

Stay on the same `main` branch. The vibe-coded commit is fine to leave in place — pretend you've decided to keep the feature for now and you're moving on to the next ticket.

In your pair, decide: **who's driving the agent, who's watching the diff?** Swap halfway through.

### The task

Open Claude Code in this folder:

```bash
cd labs/block3-4-contact-list
claude
```

Give it this exact prompt:

> Add a search feature to the contact list page. Users should be able to filter the list by typing in a search box.

Run the agent in **Normal mode** (so you confirm each edit). As the watcher, your job is to decide *in real time* whether to:
- **Let it run** — the next edit looks reasonable
- **Steer it** — interrupt with a small clarification
- **Stop and reset** — it's heading somewhere bad enough that intervening late will be costlier than starting over

Note every decision point on a small piece of paper.

### The mid-task curveball (≈10 min in)

Once the agent has gotten partway through, give it this follow-up prompt without waiting for it to finish:

> Actually, the search should also filter by email, not just name.

Watch what it does to the partial work. Did it adapt cleanly? Did it abandon a half-built feature? Did it leave you with a worse codebase than you started with?

### Debrief (10 min, pairs share with whole group)

- What was your most decisive intervention? Why?
- Was there a moment you should have intervened and didn't?
- Did the requirement-change disrupt the agent more or less than you expected?

---

## Exercise 3.4 — Plan vs. Execute Mode showdown (20 min)

> Goal: feel the difference between forcing a plan and letting the agent dive in.

### Setup

Reset the search feature so we run the same task twice fresh:

```bash
git stash         # or, if you committed: git reset --hard origin/main
```

Pair off into two groups for this exercise. (Two pairs work side-by-side; trios are fine if you have an odd number.)

### The same task, two ways

Both pairs use this prompt:

> The contact list needs a "show only contacts from a specific company" filter. Add it.

- **Pair A** runs in **Normal mode**. Just send the prompt. Whatever the agent does, do.
- **Pair B** starts in **Plan mode** (`/plan` or shift-tab to plan mode in Claude Code, depending on your build). Have the agent produce a plan first. **Read it together.** Push back on at least one thing — ambiguity, a suspicious decision, a missed file. Then accept the (revised) plan and let the agent execute.

Both pairs: stop when the agent reports done, regardless of whether the result is good.

### Compare

Both pairs `git diff` their results and present them to the room. Discuss:

- Which approach produced fewer surprises in the diff?
- Which felt slower in the moment? Which was actually slower wall-clock?
- For Pair B: did the plan reveal something about the codebase you wouldn't have noticed otherwise?
- When (in your real work) would you reach for plan mode by default vs. only for "scary" tasks?

### Reset before Block 4

Either keep what you've built, or `git stash` / `git reset` back to the `5d6ec4f` baseline — both are fine. Block 4 doesn't depend on a clean slate, only on the same codebase.

---

## What you should walk out of Block 3 with

- A felt sense for *what* unsupervised agent output looks like in this codebase, not just an abstract worry.
- A working diff-review checklist you'd happily apply to a real PR.
- A working rule-of-thumb for when to switch out of auto-accept.
- One clear "I should have intervened here" moment from Exercise 3.3 — the most useful thing you'll take to your team.

When everyone's ready, move on to [`EXERCISE-BLOCK-4.md`](./EXERCISE-BLOCK-4.md).
