# Block 9 — Test the `security-reviewer` Subagent (15 min)

> **Block goal:** confirm that the subagent you just built is actually doing its job. A subagent that produces *plausible-sounding* findings on every input is worse than no subagent at all — it trains you to ignore it. We're checking that **this** subagent finds the things it should and stays quiet about the things it shouldn't.

This is the testing slot from Block 9 Step 3. You've already built `security-reviewer` (Step 2) — either from scratch or by adapting the [reference subagent](../../examples/security-reviewer.md). Now you point it at a piece of code with **known planted issues** and score the result.

---

## Setup checklist (3 min)

- [ ] You have a `security-reviewer` subagent registered, either at `.claude/agents/security-reviewer.md` (project-scoped — recommended for the workshop) or `~/.claude/agents/security-reviewer.md` (user-global).
- [ ] `/agents` lists `security-reviewer`.
- [ ] You're running Claude Code from inside `labs/block9-security-snippet/`. (Strictly the subagent doesn't care which folder — it reads files by path. But running from this folder makes the prompts shorter.)
- [ ] You've **not** read the *"What's planted"* section below yet. (It's the answer key.)

---

## Exercise 9.4 — Run the review (7 min)

> Goal: get a structured report back from your subagent and compare it to the planted issue list.

### Step 1 — invoke the subagent

In Claude Code:

```
@security-reviewer please audit src/app/app.ts and src/app/profile.service.ts in this lab. Report all findings using the structured format you were given.
```

(Adjust the invocation syntax to whatever your subagent expects. Some setups want `/agents security-reviewer ...`, some auto-pick the right subagent based on the task description. Either way: explicit scope = these two files, output format = the structured report.)

### Step 2 — read what you got back

The reference subagent produces one finding per issue, with severity, location (`file:line`), category, what/why/fix. Your output should look similar (yours might have different category labels — that's fine).

Don't move on until you've read the whole report. The exercise is wasted if you just count findings without reading them.

### Step 3 — score against the planted issues

**Now scroll down to the *"What's planted"* section below**, compare your subagent's findings to the list, and check off:

- [ ] All five planted categories were called out (or at minimum, all five planted issues even if your subagent uses different category labels).
- [ ] The `file:line` locations roughly match the actual sink locations.
- [ ] No obvious false positives (the subagent didn't invent a finding that isn't there).
- [ ] No "everything looks fine!" hallucination — the subagent shouldn't downgrade a real issue to *Informational*.

A perfect run gets all five with reasonable severity assignments. **Misses are interesting** — if your subagent missed one, was it because the system prompt didn't list that category? Or because the wording in the source didn't match how the subagent looks for it?

---

## Exercise 9.5 — Discussion (5 min)

Open conversation with the room:

- Whose subagent caught the most? Whose missed the most? What's the difference between the two prompts?
- Did anyone's subagent flag something **in addition** to the planted five? Was it real or noise?
- For the issues your subagent caught, would you trust the *suggested fix* paragraph it produced enough to hand straight to an implementing agent? Or does the fix advice still need a human pass?
- Where would you actually wire this subagent in your team's flow — pre-commit hook? PR-review bot? Manual `/agents security-reviewer` only when touching auth code? The reference subagent's frontmatter (`tools: Read, Grep, Glob, Bash(git diff:*)`) is read-only on purpose — does that change where it can run safely?

---

## What you should walk out of Block 9 with

- A working `security-reviewer` subagent at `.claude/agents/security-reviewer.md` you can reuse on your own projects (and that you've now seen *actually find planted bugs*, not just produce confident-sounding output).
- A working `/conventional-commit` skill at `.claude/commands/conventional-commit.md` from the earlier exercise (tested against your own current uncommitted changes — no separate sandbox lab folder for that one, per WIP-WORKSHOP-UMBRELLA D2).
- A felt sense for **the trust gap**: a subagent that *might* catch a vulnerability is much less useful than one with a known catch-rate on representative test cases. Build → test against planted issues → only then trust on real diffs.

---

# What's planted (the answer key)

> **Don't read this until you've run the subagent and have its report in front of you.** Otherwise you're scoring your subagent against a list you've already read, which is not the experiment.

The lab plants **five distinct issues**, each from a different category in the [`security-reviewer` reference subagent](../../examples/security-reviewer.md)'s 7-category audit checklist. Locations refer to files at the time of writing — line numbers may drift if the lab is edited.

| # | Category | Where | What |
| --- | --- | --- | --- |
| 1 | **4. Cross-site scripting (XSS) and template safety** | `src/app/app.ts` — the `trustedBio` computed signal and its `[innerHTML]="trustedBio()"` binding in the *Live preview* `<article>` | The bio is **user-controlled rich text** wrapped in `DomSanitizer.bypassSecurityTrustHtml(...)`, then rendered via `[innerHTML]`. Plain `[innerHTML]="bio()"` would be safe (Angular's built-in sanitizer auto-strips dangerous content with a console warning). The `bypassSecurityTrustHtml` call **explicitly opts out** of that protection — so a bio of `<img src=x onerror="alert(1)">` runs JavaScript in the user's browser. The "(HTML allowed)" form hint even invites it. **Fix:** delete the `bypassSecurityTrustHtml` wrapper entirely — `[innerHTML]="bio()"` will then sanitize automatically. If you genuinely need richer HTML support, sanitize with a vetted allow-list library (DOMPurify, sanitize-html) *before* the bypass, and only bypass on the post-sanitization output. **Reviewer note:** plain `[innerHTML]="x"` is safe by default in Angular — the framework runs `DomSanitizer` automatically and emits a console warning (*"sanitizing HTML stripped some content"*) when it removes anything dangerous. Don't flag it on its own. The actual Angular XSS sinks are the `bypassSecurityTrust*` family (which this lab uses), `ElementRef.nativeElement.innerHTML = ...` writes that bypass the framework entirely, and `[src]` / `[href]` bound to user-controlled URLs without scheme validation. |
| 2 | **3. Sensitive data exposure** | `src/app/profile.service.ts` — `MODERATION_API_KEY` constant at the top | An API key for the third-party moderation service is **hardcoded into client-side source code**. Anyone who opens DevTools or reads the production bundle sees the key, can extract it, and can run their own usage against the moderation provider on this account's quota. **Fix:** the moderation call has no business happening client-side — proxy it through your own backend, where the key lives in env-only config. The client should call your `/api/profile` and let the server decide whether to invoke moderation. |
| 3 | **6. Insecure dependencies & primitives** | `src/app/profile.service.ts` — `generateKeepaliveToken()` | A session-keepalive token is generated using `Math.random().toString(36)`. `Math.random()` is **not a cryptographic random source** — its output is predictable from a small amount of leaked output, and any value used as a security token (session, CSRF, password reset, anti-replay) must come from `crypto.getRandomValues()` (browser) or `crypto.randomBytes()` (Node). **Fix:** `crypto.getRandomValues(new Uint8Array(16))` and base64url-encode it. Better: don't generate session tokens client-side at all — the server should issue them. |
| 4 | **7. SSRF, redirect, and external request hygiene** | `src/app/profile.service.ts` — `previewAvatar(url)` | The component does `fetch(url)` against a URL the user typed. The server-side equivalent of this would be a textbook SSRF (the agent would happily fetch `http://169.254.169.254/...` to pull cloud metadata, or `file:///etc/passwd`). On the client it's a milder issue but still real: it can fetch internal-network resources, leak the user's session cookies to attacker-controlled servers if `credentials: 'include'` is ever added, or be coerced into running arbitrary `javascript:` URLs depending on context. **Fix:** validate the URL — only `https:` scheme, only an allow-list of known image-hosting domains. Reject anything else before the `fetch`. |
| 5 | **5. Input validation & deserialization** | `src/app/app.ts` — `onSubmit()` calls `service.save(this.form.getRawValue())`; `src/app/profile.service.ts` — `save()` ships the raw object to `/api/profile` | The form has **no client-side validation** (no `Validators`, no length checks, no schema), and the service POSTs `getRawValue()` as-is — a textbook **mass-assignment** setup if the backend trusts whatever shape comes through. A bio could be 5 MB long, the display name could be empty, the tags CSV could contain 10,000 entries. **Fix:** apply `Validators.required` / `Validators.maxLength(...)` on the form controls, and have the server *also* validate (defense in depth — the backend can never assume the client did its job). On the client, prefer an explicit `ProfileSubmitDto = { displayName: string; bio: string; ... }` shape rather than handing the form's raw value to the service. |

If your subagent caught all five with reasonable severity (1 and 2 should be **High** or **Critical**, 3 and 4 **Medium** or **High**, 5 **Medium**) — congratulations, it's working. If it missed one, the gap is interesting: read your subagent's prompt and figure out *why* the category wasn't covered, then iterate.

---

## Notes for facilitators

- **Why these five and not others?** They cover five distinct categories from the reference subagent's checklist, with no overlap. A lab with three XSS variants would only test one category. Five from five categories tests the breadth of the subagent.
- **The two "out of category" categories** (1 — Injection, 2 — Auth/Authz) don't get planted because there's no SQL or auth flow in this client component. If you want to extend the lab, the natural place is to add a tiny mock backend (Express/NestJS in a sibling folder) and plant a SQL injection + a missing auth check there. The reference subagent already covers both categories and would find them.
- **The `security-reviewer` subagent reference is at `examples/security-reviewer.md`.** Encourage participants to compare their own subagent against it *after* the exercise — answer-key style.
- **Common subagent failure modes** observed in dry-runs: (a) flagging the bio binding as "potential XSS" with low severity instead of "definite XSS, high severity"; (b) missing the `Math.random` issue entirely if the prompt doesn't list "weak randomness for security tokens" by name; (c) finding the API key but suggesting "move to environment variable" without noting the endpoint shouldn't be called client-side at all.
