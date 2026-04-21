# Pre-Workshop Environment Setup

> **Time required:** ~30 minutes. Do this **at least 24 hours before Day 1** so we can troubleshoot in office hours instead of eating into the workshop.

This guide gets your machine to the state where Claude Code launches, talks to **MiniMax-M2.7-highspeed** through MiniMax's Anthropic-compatible endpoint, and is ready to run every exercise in the workshop.

If you already have an Anthropic Claude Max subscription and want to use Anthropic's models instead, skip to [Appendix A — Using Anthropic instead of MiniMax](#appendix-a--using-anthropic-instead-of-minimax).

---

## What you'll install

| Tool | Version | Why |
|------|---------|-----|
| Node.js | **22 LTS or newer** | Required for Claude Code, OpenSpec, and the lab apps (Angular CLI 21+, NestJS 11+) |
| Git | any recent | Diff/rollback mechanism for every CLI agent we use |
| Google Chrome | latest stable | Block 5 Chrome DevTools-MCP exercise |
| Claude Code | latest | The agent harness we use throughout |
| **MiniMax API token** | — | Provided per participant by your facilitator |

VSCode is recommended (integrated terminal + diff view) but not required.

---

## Step 1 — Verify the basics

Open a terminal and run:

```bash
node --version       # must print v22.x or higher
git --version        # any recent version is fine
git config --get user.name
git config --get user.email
```

If `node --version` is below v22 or missing, install via [nodejs.org](https://nodejs.org/) (LTS), [nvm](https://github.com/nvm-sh/nvm), `nvm-windows`, `fnm`, or your package manager of choice.

If your `git` user name/email isn't set:

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

---

## Step 2 — Install Claude Code

Per [Anthropic's install docs](https://docs.claude.com/en/docs/claude-code/setup):

```bash
npm install -g @anthropic-ai/claude-code
claude --version    # should print a version string
```

> **Windows native users:** Claude Code runs in PowerShell, Windows Terminal, or Git Bash. WSL also works and is what most workshop facilitators use — install Node + Claude Code *inside* WSL, not on the Windows host.

---

## Step 3 — **Critical:** unset any pre-existing Anthropic env vars

This is the **#1 setup failure mode** per the [official MiniMax guide](https://platform.minimax.io/docs/guides/text-ai-coding-tools). If `ANTHROPIC_AUTH_TOKEN` or `ANTHROPIC_BASE_URL` are set as **shell environment variables**, they silently override `~/.claude/settings.json` and Claude Code hits the wrong endpoint with the wrong key.

Check whether they're set:

```bash
# macOS / Linux / WSL
echo "BASE: $ANTHROPIC_BASE_URL"
echo "TOKEN: $ANTHROPIC_AUTH_TOKEN"
```

```powershell
# Windows PowerShell
echo "BASE: $env:ANTHROPIC_BASE_URL"
echo "TOKEN: $env:ANTHROPIC_AUTH_TOKEN"
```

If either prints a non-empty value, unset them — and **also remove them from your shell profile** (`~/.bashrc`, `~/.zshrc`, `~/.profile`, `~/.config/fish/config.fish`, PowerShell `$PROFILE`, etc.) so they don't come back next time you open a terminal:

```bash
# macOS / Linux / WSL
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_AUTH_TOKEN
```

```powershell
# Windows PowerShell — current session
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue

# Windows — permanent (re-open terminal afterwards)
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $null, "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $null, "User")
```

After unsetting, **open a fresh terminal** and re-run the `echo` commands. Both should print empty.

---

## Step 4 — Configure Claude Code to point at MiniMax

Your facilitator will email you a personal **MiniMax API token** before the workshop. Keep it private (treat it like a credit card number) and don't commit it to any repo.

Create or edit `~/.claude/settings.json` (Windows: `%USERPROFILE%\.claude\settings.json`). If the file already exists, **merge** the `env` block into the existing JSON — don't replace the whole file.

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.minimax.io/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "<PASTE-YOUR-MINIMAX-API-KEY-HERE>",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
    "ANTHROPIC_MODEL": "MiniMax-M2.7-highspeed",
    "ANTHROPIC_SMALL_FAST_MODEL": "MiniMax-M2.7-highspeed",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "MiniMax-M2.7-highspeed",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "MiniMax-M2.7-highspeed",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "MiniMax-M2.7-highspeed"
  }
}
```

What each field does:

- **`ANTHROPIC_BASE_URL`** — points Claude Code at MiniMax's Anthropic-compatible endpoint instead of Anthropic's own
- **`ANTHROPIC_AUTH_TOKEN`** — your personal MiniMax API token
- **`API_TIMEOUT_MS`** — long agentic turns can take a while; the default is too low
- **`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`** — skips telemetry that requires Anthropic-side endpoints
- **`ANTHROPIC_MODEL` + the four `ANTHROPIC_DEFAULT_*` overrides** — every Anthropic model alias (Sonnet/Opus/Haiku/small-fast) is rerouted to `MiniMax-M2.7-highspeed`. Without these, anything in Claude Code that asks for "haiku" or "opus" by name would fail.

---

## Step 5 — Verify everything works

In a **fresh terminal**, in any folder:

```bash
claude
```

Then inside Claude Code:

1. Run `/model`. The active model should be `MiniMax-M2.7-highspeed`. If it shows anything else, your `settings.json` isn't being read — see [Troubleshooting](#troubleshooting) below.
2. Type a simple prompt like `say hi in one sentence`. You should get a response within a few seconds.
3. Run `/cost` — confirms you're hitting the API and tokens are flowing.
4. Press `Shift+Tab` twice — the bottom mode indicator should cycle through Normal → Auto-accept-edits → Plan and back. Confirm the indicator updates each time.
5. Quit with `/quit` (or `Ctrl+C`).

If all five steps worked, you're done. See you on Day 1.

---

## Step 6 — Clone the workshop repo

```bash
git clone https://github.com/syncrea/aicas-workshop-repo.git
cd aicas-workshop-repo
ls
```

You should see `labs/`, `setup/`, `exercises/`, `references/`, `examples/`, `mcp-snippets/`, etc. Read the top-level `README.md` once so you know the repo shape before Day 1.

> **Don't open the umbrella root in VSCode for any lab.** Each lab is meant to be opened standalone (`File → Open Folder…` on the lab folder, or `cd labs/<lab-name> && code .`). The facilitator will tell you which lab to open and when.

---

## Step 7 — Optional but recommended pre-workshop chores

These take 5–10 minutes and save real time on Day 2:

- **Install OpenSpec** (used in Block 7 and again in Block 8):

  ```bash
  npm install -g @fission-ai/openspec@latest
  openspec --version
  ```

- **Install Chrome** if you don't already have it (used in Block 5 Part 2). The Block 5 lab folder ships a pre-configured project-scope `.mcp.json` for Chrome DevTools-MCP — full setup walkthrough is in `labs/lab2-chrome-devtools-bug/README.md`. **The first time you start `claude` inside any lab folder that ships a `.mcp.json`, Claude Code shows a one-time approval prompt** (*"Use the MCP servers configured in `.mcp.json`?"*) — accept it, otherwise the MCP stays inactive.

- **Install Codanna** (used in Block 5 Part 1). Per [github.com/bartolli/codanna](https://github.com/bartolli/codanna): `cargo install codanna` if you have the Rust toolchain, or download a release binary. Verify with `codanna --version`. The Block 5 hands-on then runs `codanna index .` against a fresh `angular/angular` clone, which takes ≈5–10 minutes — pre-installing the binary saves that time slot for the actual exercise.

- **For the inter-day homework (Day 1 → Day 2):** decide which stack and app idea you want to use for Block 8 (the "Build Your Own" lab). See `exercises/block8-project-ideas.md` if you don't have one in mind. If you have time, scaffold the project and make an initial commit — you'll save 30–45 minutes on Day 2.

---

## Troubleshooting

### `/model` shows the wrong model

You almost certainly still have `ANTHROPIC_MODEL` or one of the override env vars set in your shell. Re-do Step 3 carefully. Open a fresh terminal afterwards (env-var changes don't apply to terminals that were already open).

### Claude Code says "401 Unauthorized" or "invalid API key"

- Confirm your token in `settings.json` is the **MiniMax** token your facilitator emailed you, not an Anthropic key from somewhere else.
- Confirm `ANTHROPIC_AUTH_TOKEN` is **not also set** as a shell env var pointing at a different key. Shell env vars win.

### Claude Code says "ENOTFOUND api.minimax.io" or hangs

- Your network is blocking the endpoint. Try a different network (mobile hotspot test). Corporate proxies sometimes need explicit allow-listing of `api.minimax.io`.

### `settings.json` isn't valid JSON after editing

Validate it with `cat ~/.claude/settings.json | python -m json.tool` (or paste into [jsonlint.com](https://jsonlint.com/)). Trailing commas, missing quotes, and stray characters are the usual culprits.

### Windows-only: `npm install -g` fails with permission errors

- Run the install in an elevated PowerShell (Administrator), **or**
- Use `nvm-windows` / `fnm` (recommended — no admin rights needed)

### WSL-only: Chrome can't launch from WSL for the Block 5 DevTools-MCP exercise

That's normal — WSL has no display server. The Block 5 lab includes a WSL-specific recipe that installs a headless Chrome via Puppeteer and points the MCP at it. You don't need to do anything before the workshop; the lab's `README.md` walks through it.

---

## Office hours

A 30-minute office-hours slot is held the **day before Day 1**. If any of the verification steps above failed and you couldn't unblock yourself, join that slot — your facilitator will email the link.

---

## Appendix A — Using Anthropic instead of MiniMax

If you have an active Anthropic Claude Max subscription or your own Anthropic API key, you can point Claude Code at Anthropic directly. The workshop content is identical — only the endpoint differs.

**Option 1 — Claude Max (subscription):** just `claude` and let it walk you through OAuth login. Don't add the `env` block from Step 4 at all.

**Option 2 — Anthropic API key:** put `ANTHROPIC_AUTH_TOKEN` in `settings.json` but **omit `ANTHROPIC_BASE_URL` and the model overrides** — Claude Code uses Anthropic's defaults:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "<your-anthropic-api-key>"
  }
}
```

Verify with `/model` — should show one of `claude-*` (e.g. `claude-sonnet-4-6`).

Either way, every concept and exercise in the workshop transfers 1:1.

---

## Appendix B — What got installed where

For your records — useful if you ever want to clean up:

- `~/.claude/settings.json` — global Claude Code config (model, base URL, MCPs, defaults)
- `~/.claude/agents/` — global subagents (we'll create some in Block 9)
- `~/.claude/commands/` — global skills (we'll create some in Block 9)
- `~/.claude/plans/` — auto-persisted Plan-mode plans (Claude Code writes here)
- `<global npm prefix>/bin/claude` — the Claude Code CLI binary

Nothing else in this guide installs anything outside those paths.
