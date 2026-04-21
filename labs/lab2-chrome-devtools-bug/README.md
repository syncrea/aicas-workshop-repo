# Block 5 Lab — Chrome DevTools-MCP UI Bug

A tiny single-page Angular 21 app with a **deliberately planted UI bug** that is hard to find by reading the source but obvious once you let an agent look at the rendered page through Chrome DevTools-MCP. Used in **Block 5, Part 2** (after the Codanna semantic-search round on the Angular monorepo).

> **Stop here if you haven't done the [environment setup](../../setup/environment-setup.md).**
> You need Claude Code installed and pointing at MiniMax-M2.7-highspeed (or your assigned model) before any of the exercises below will work.

---

## What the app does (and what it doesn't)

A single page with a feedback form: name, message, **Send feedback** button. After submitting, you should see a green confirmation card *("✅ Thanks {name}, we received your feedback.")*.

The bug is: clicking **Send feedback** appears to do nothing. The form clears, but the confirmation card never shows up.

The component code is correct. The cause lives elsewhere — and finding it from the source alone is annoying. Finding it from the *running page* is a 30-second job. That's the whole point of the lab.

---

## Run the app

```bash
cd labs/lab2-chrome-devtools-bug
npm install
npm start
```

Open http://localhost:4200/. Fill in the form, click **Send feedback**, observe the (lack of) success card.

Useful scripts:

```bash
npm test            # vitest, runs once
npm run build       # production build
```

---

## Chrome DevTools-MCP setup

The lab ships with a project-level `.mcp.json` so the agent picks the server up automatically once you're inside this folder. The default config uses the `chrome-devtools-mcp` package's `--auto-connect` mode, which works out of the box on **Windows (native) and macOS** with a system Chrome installation.

### 1. Launch Chrome with the remote debugging port

The MCP server attaches to a Chrome process that has the remote debugging protocol enabled. Start Chrome explicitly with `--remote-debugging-port=9222` (close all other Chrome windows first, otherwise the new flag is ignored):

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Windows:**
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Open http://localhost:4200/ in that Chrome window.

### 2. Start Claude Code from this folder

```bash
cd labs/lab2-chrome-devtools-bug
claude
```

Claude Code reads `.mcp.json` on startup. **The first time you start `claude` in a folder that has a project-scoped `.mcp.json`, Claude Code shows a one-time approval prompt** (*"Use the MCP servers configured in `.mcp.json`?"*) — accept it, otherwise the server stays inactive. If you accidentally declined, reset with `claude mcp reset-project-choices` and restart.

Verify the server is registered:

```
/mcp
```

You should see `chrome-devtools` listed. The first invocation also downloads the MCP server via `npx` — give it a few seconds.

### 3. (WSL / headless Linux only) swap to the WSL config

The default `.mcp.json` won't work on WSL because there's no display. Replace the file's contents with the WSL recipe and install Puppeteer's Chrome first:

```bash
npx -y @puppeteer/browsers install chrome@stable --path ~/chrome
```

Note the binary path the install command prints. Then replace `.mcp.json` with the snippet from [`mcp-snippets/chrome-devtools-wsl.json`](../../mcp-snippets/chrome-devtools-wsl.json) and update `--executablePath` to the printed path.

> The committed `.mcp.json` is the Windows/macOS recipe by design. If you swap it for the WSL one, **don't commit the swap** — `git restore .mcp.json` before any commit so the next participant on Windows still gets a working default.

---

## Stack at a glance

| Concern | Choice |
| --- | --- |
| Angular | 21.x, standalone, signals, zoneless |
| Templates | Inline, `@if` / `@for` |
| Forms | Reactive forms via `NonNullableFormBuilder` |
| Styling | Tailwind 4 (CSS-first config) |
| Tests | Vitest via `@angular/build:unit-test` |

Conventions match `labs/lab1-contact-list/` — reusing the same Angular shape lets the lab focus entirely on the MCP, not on the framework.

---

## Folder map

```
labs/lab2-chrome-devtools-bug/
├── .mcp.json               # Chrome DevTools-MCP server, project scope (Windows/macOS default)
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.css          # ← the bug lives here, NOT in app.ts
│   └── app/
│       ├── app.ts          # the feedback form component (correct as-is)
│       └── app.config.ts
├── package.json
├── angular.json
├── README.md               # this file
└── EXERCISE-BLOCK-5.md     # the exercise prompt the facilitator reads
```

> Spoiler-light hint, in case you want one before you start: the bug is in CSS, not TypeScript. **Use the agent + Chrome DevTools-MCP first.** Don't grep your way to the answer — that defeats the lab.

---

## Where to go next

Open [`EXERCISE-BLOCK-5.md`](./EXERCISE-BLOCK-5.md) and follow the prompts.
