# Working Mode (Agent ↔ Human)

> **Audience:** the AI agent working in this lab, and the human supervising it.
>
> The other guideline docs cover *what* the code should look like. This one covers *how* the agent should make changes — the working agreement between the agent and the human supervising it. When the working mode is wrong, the code conventions don't matter.

---

## Verify, don't assume

The single most damaging failure mode in agent work is *confidently asserting something that hasn't been checked*. Avoid it.

- **Trivial change, fully visible to the LSP / compiler / test run** → fine to proceed without an extra check.
- **Anything else** → verify before claiming it works. The bar is the same one a careful engineer uses: would I sign off on this PR with what I currently know? If the answer involves "should be fine because…", it's not verified.

What "verify" means in practice:

| Situation | Verification |
| --- | --- |
| Code change to a typed module | Re-read the diff, run `npx nx lint <project>` and `npx nx test <project>` (or the narrowest test that exercises the change). |
| New API endpoint or change to one | `curl` it (or use `apps/api/test.http` if you added a case) — don't assume the wire shape from the controller's signature. |
| Frontend change that crosses an HTTP boundary | Check that the request URL, headers (`X-User-Id`), and response shape actually match what the backend now returns. |
| Behaviour that depends on a third-party library | Open the library's source under `node_modules/` or fetch its docs — don't guess at an API. |
| Database / Prisma schema change | Run `npx prisma migrate dev` and verify the migration file is what you expected. Run a query against the seeded DB to confirm. |
| Build / config change | Run the affected `npx nx <target> <project>` end-to-end. "It type-checks" is not the same as "it builds". |
| Anything cross-system (frontend ↔ backend, app ↔ shared-types) | Run *both* sides against each other locally before declaring it done. |

If verification is *impossible* in the current environment, **say so** and name what would be needed to actually verify it. Don't smuggle the assumption into the result.

---

## Work in chunks; pause for review

Long agent runs that ship a wall of changes are hard to course-correct. Default to short, reviewable chunks.

- Break any non-trivial task into **explicit sub-steps** up front (a short TODO list is enough). Tell the human what the steps are before starting.
- After each meaningful chunk — a feature added, a refactor finished, a migration written — **stop and summarise**. State: what changed, what was verified, what is still open.
- **Wait for the human to confirm** before moving to the next chunk. "Continuing to the next step" without that confirmation defeats the purpose of working in chunks.
- A chunk that touches more than ~3 files, or any chunk that crosses an app boundary (frontend ↔ backend, app ↔ shared-types), is almost certainly worth a pause.
- If the human pre-authorises the whole list ("just do all of them"), still pause if a step turns out to be substantially different from what was planned.

The human's "go" is cheap. Re-doing a half-wrong refactor is not.

---

## Make uncertainty visible

The human can only correct what they can see. Don't paper over uncertainty with confident prose.

- When you're guessing, say so explicitly: *"I haven't verified this — I'm assuming the response shape matches the existing handler."*
- When two reasonable approaches exist, **name both** and ask which to take, instead of silently picking one.
- When a request is ambiguous, ask one focused question rather than producing a plausible-but-possibly-wrong answer.
- "I think" / "probably" / "should" in your own output are signals to either verify the claim or surface the uncertainty to the human.

---

## Plan before doing on non-trivial work

For anything beyond a one-file change, a short plan is mandatory before edits start.

- Identify the files involved.
- State what you're about to change and *why*.
- Call out the order so the human can object before the work happens, not after.

A plan doesn't have to be long — three bullets is often enough — but it must exist before code starts changing. If the plan changes mid-work (you discovered something), surface that and pause before continuing along the new path.

---

## Read before writing

Don't edit a file you haven't actually read in this session. Trusting your prior knowledge of "what's probably in there" is how guideline drift, ghost imports and broken assumptions get introduced.

- Read the file (or the relevant section, for big files).
- Read the closest neighbour — if you're touching `tasks.service.ts`, glance at `projects.service.ts` to confirm the local pattern.
- Check the existing tests for the area; they often encode invariants that aren't in the prose docs.

---

## Stay in scope

Adjacent code that "could be tidier" is not part of the task unless the human asked.

- Fix a real bug you trip over, but say so explicitly — don't bundle it silently.
- Don't reformat untouched files. Don't reorder imports in files you weren't editing. Don't rename "while you're in there".
- A scope-creep diff is harder to review than the change the human actually asked for, and it hides the real change from `git log`.

If you genuinely think a refactor is warranted, **propose it as a separate next chunk**, don't slip it into the current one.

---

## Report honestly

The human is downstream of you. What you say in the summary is what they'll act on.

- If a test failed and you skipped it, say "skipped — failing", not "all tests pass".
- If you couldn't run a check, say "did not run" — never imply "passed".
- Paste the real command output (or the relevant lines) for any non-trivial verification, especially failures. Don't paraphrase test output into a "looks good".
- "Done" means *verified done*. If a step is unverified, say *"applied but not verified"*.
- When something didn't work and you fixed it, name the actual cause in the summary, not just "fixed it". The human is learning the system too.

---

## Don't fight failing tests, lints, or types

If a test, a lint rule, or the type system is in your way, the default action is **fix the underlying code**, not silence the signal.

- Don't delete or weaken an assertion to make a test pass. If the test is genuinely wrong, change it deliberately and call it out.
- Don't add `// @ts-ignore`, `// eslint-disable`, `as any`, or empty `catch {}` to make a problem disappear. The escape hatches are for genuinely unfixable cases — and those cases require a comment explaining *why*.
- If the only way you can see to make something pass is to disable the check, that's a signal to stop and ask, not to disable the check.

---

## Cleaning up after yourself

A session that leaves the working tree in a worse state than it found it isn't done.

- No dead scratch files committed alongside the real change.
- No `console.log` / `print(...)` debug lines left in committed code.
- No "TODO: come back to this" without a real reason — if you skipped something, say so in the summary so the human can decide whether to track it.
- Run the project's lint/format target on the files you changed before declaring done.

---

## What to do when this file doesn't cover your case

Default to the more cautious read of the rule. When in doubt:

1. Verify rather than assume.
2. Pause and ask rather than press on.
3. Make the uncertainty visible in your summary.

The cost of a small, well-flagged pause is much lower than the cost of an unflagged wrong assumption that ships.
