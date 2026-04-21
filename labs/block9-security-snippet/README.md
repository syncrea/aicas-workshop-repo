# Block 9 Lab — Security-Reviewer Subagent Test Snippet

A tiny single-page Angular 21 app that looks like an everyday SaaS *"Edit your public profile"* screen — display name, rich-text bio, avatar URL, tags, save button. **Five distinct security issues are deliberately planted** in `src/app/app.ts` and `src/app/profile.service.ts`, each mapping to a separate category from the [`security-reviewer`](../../examples/security-reviewer.md) reference subagent's audit checklist.

You'll use this app as the **target** for the `security-reviewer` subagent you build in Block 9. Did your subagent catch all five issues? The lab's [`EXERCISE-BLOCK-9.md`](./EXERCISE-BLOCK-9.md) lists exactly what's planted (after the exercise) so you can score yourself.

> **Stop here if you haven't done the [environment setup](../../setup/environment-setup.md).**
> You need Claude Code installed and pointing at MiniMax-M2.7-highspeed (or your assigned model) before any of the exercises below will work.

---

## What this lab is *not*

- **Not** a security training course. It's a *test target* for an AI subagent that does security review. The fact that the bugs are findable by an attentive human reading the code is a feature, not a bug — that's how you know the AI subagent did its job when it finds them.
- **Not** the same kind of lab as Blocks 3, 4, 6, 7. There's no "supervise the agent fixing this" exercise. The agent's job is to *review and report*, not to fix. Per the reference subagent's design, the security-reviewer is **read-only**.
- **Not** a comprehensive vuln dump. Five issues, each from a different category, picked so a working subagent should produce five distinct findings — not "everything is on fire" noise.

---

## Run the app (optional)

You don't need to run the app to do the security review — the subagent reads source. But if you want to see the surface visually:

```bash
cd labs/block9-security-snippet
npm install
npm start
```

Open http://localhost:4200/. The form is wired but the backend endpoints (`/api/profile`, `https://moderation.example.com/...`) don't exist, so submit/preview will fail in the network tab. That's fine — the security review doesn't depend on it working.

```bash
npm test       # vitest, runs once
npm run build  # production build
```

---

## Stack at a glance

| Concern | Choice |
| --- | --- |
| Angular | 21.x, standalone, signals, zoneless |
| Templates | Inline, `@if` / `@for` |
| Forms | Reactive forms via `NonNullableFormBuilder` |
| Styling | Tailwind 4 |
| HTTP | Plain `fetch` (deliberately — see EXERCISE notes) |

Conventions match the other labs (`block3-4-contact-list/`, `block5-chrome-devtools-bug/`) so the code looks unremarkable. The point is that *realistic-looking* code can carry serious security issues, and the AI subagent's job is to spot them anyway.

---

## Folder map

```
labs/block9-security-snippet/
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.css
│   └── app/
│       ├── app.ts                # the form component (planted issues here)
│       ├── app.config.ts
│       ├── profile.model.ts      # form value type
│       └── profile.service.ts    # http calls (planted issues here too)
├── package.json
├── angular.json
├── README.md                     # this file
└── EXERCISE-BLOCK-9.md           # the exercise + the answer key
```

---

## Where to go next

Open [`EXERCISE-BLOCK-9.md`](./EXERCISE-BLOCK-9.md). Build your `security-reviewer` subagent first (Block 9 Step 2 in the workshop), then point it at this lab.
