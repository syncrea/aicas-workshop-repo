# MCP Snippets

Pre-tested **MCP server configuration snippets** for the workshop. Each `*.json` file is a standalone `.mcp.json` fragment you can copy or merge into a project's `.mcp.json` to register the server with Claude Code (and most other MCP-compatible tools — same file shape).

> **Always verify after registering:** start Claude Code, then run `/mcp`. The server should appear in the list and report a healthy connection. If it doesn't, the snippet is wrong (or the server's auth/setup wasn't completed).

---

## When to use each one

| File | MCP | When to add it | When to skip |
|------|-----|----------------|--------------|
| [`codanna.json`](./codanna.json) | **Codanna** — semantic code search + symbol/relationship graph | Large codebase (thousands of files) where grep starts to lose. Block 5 uses it on `angular/angular` (~6.4k files / 62k symbols). | Small/fresh projects — overkill, and the index needs to be built first. |
| [`chrome-devtools-windows.json`](./chrome-devtools-windows.json) | **Chrome DevTools-MCP** (Windows / macOS native Chrome) | Frontend work where the agent needs to *see* the rendered UI — visual bugs, layout issues, runtime errors, network inspection. | Pure backend, CLI tools, or anything without a browser-rendered UI. |
| [`chrome-devtools-wsl.json`](./chrome-devtools-wsl.json) | **Chrome DevTools-MCP** (WSL / headless Linux) | Same as above, but you're on WSL or a Linux machine without a display server. Requires installing headless Chrome via Puppeteer first. | Same skip rules as the Windows variant. |
| [`context7.json`](./context7.json) | **Context7** — current, version-specific library docs | Fast-moving frameworks where the model's training cutoff produces stale APIs (Angular, Next.js, Nuxt, Prisma, NestJS, etc.). | Long-stable libraries / your own code (`AGENTS.md` is enough). |
| [`atlassian.json`](./atlassian.json) | **Atlassian Rovo MCP** — Jira / Confluence / Compass | Your team uses Atlassian Cloud and you want the agent to start work directly from a ticket ID, search Jira, summarise Confluence, etc. | Self-managed Atlassian, no Atlassian, or you don't want the agent touching tickets/pages. |
| [`gitlab.json`](./gitlab.json) | **GitLab MCP** — projects, issues, MRs, pipelines | Your team uses GitLab and you want the agent to handle MR ops, "why did this pipeline fail?", issue triage, etc. | GitHub teams (use the GitHub MCP instead) or self-managed GitLab without Duo Agent Platform. |

---

## How to add a snippet to a project

Each file ships as a complete `.mcp.json` for clarity, but the part that matters is the **`mcpServers` object**. The standard pattern is one project-root `.mcp.json` containing **all** the MCP servers that project needs, committed to git so every teammate (and every Claude Code session) picks it up automatically.

### From scratch

If your project has no `.mcp.json` yet, just copy the file you want to the project root, drop the leading `_comment` field, and rename to `.mcp.json`:

```bash
cp /path/to/this/repo/mcp-snippets/codanna.json /your/project/.mcp.json
# Then edit and remove the "_comment" line — it's documentation only.
```

### Merging into an existing `.mcp.json`

If `.mcp.json` already exists with other servers, add only the **inner entry** under `mcpServers`. Example — adding Codanna and Context7 to an existing config:

```json
{
  "mcpServers": {
    "existing-thing": { "...": "..." },
    "codanna": {
      "command": "codanna",
      "args": ["--config", ".codanna/settings.toml", "serve", "--watch"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": { "CONTEXT7_API_KEY": "..." }
    }
  }
}
```

JSON doesn't allow comments, so the `_comment` field in each snippet is a deliberate workaround — strip it before committing.

### CLI alternative

Claude Code's CLI can also register servers — useful for ad-hoc experiments, but **the project-scoped `.mcp.json` file is the preferred shape** for the workshop because:

1. It's committed to git, so the whole team gets the same setup automatically.
2. It survives across machines (CLI registrations are per-machine).
3. It's reviewable in a PR.

For reference, the equivalent CLI commands look like:

```bash
# stdio servers
claude mcp add -s project codanna -- codanna --config .codanna/settings.toml serve --watch

# HTTP servers (Atlassian / GitLab)
claude mcp add --transport http -s project atlassian https://mcp.atlassian.com/v1/mcp
claude mcp add --transport http -s project GitLab    https://gitlab.com/api/v4/mcp
```

> **PowerShell pitfall:** the inner double quotes in `claude mcp add-json` get mangled on Windows PowerShell. Editing `.mcp.json` directly is the cross-platform-safe path the workshop standardises on.

---

## Per-MCP setup notes

### Codanna

1. Install the binary — see [github.com/bartolli/codanna](https://github.com/bartolli/codanna) for the latest install command (typically `cargo install codanna` or via the release binaries).
2. Index your codebase **once** before starting Claude Code:
   ```bash
   cd /path/to/your/project
   codanna index .
   ```
   Re-index after major branch switches or when symbols you expect aren't found.
3. Drop in `codanna.json` (or merge the entry).
4. Verify with `/mcp` — the codanna entry should report healthy and expose tools like `semantic_search_with_context`, `analyze_impact`, `find_callers`, `get_calls`.
5. Encode the **codanna-first / grep-to-verify** policy in your `AGENTS.md` (see Block 5 lab notes for the exact wording).

### Chrome DevTools-MCP (Windows / macOS)

1. Have Chrome installed and on your PATH.
2. Drop in `chrome-devtools-windows.json`.
3. Start Claude Code; the MCP launches Chrome (or auto-connects to an existing instance with `--remote-debugging-port=9222`).
4. Verify with `/mcp` — the chrome-devtools entry exposes tools like `read_dom`, `read_console`, `read_network`.

### Chrome DevTools-MCP (WSL)

1. Install headless Chrome via Puppeteer:
   ```bash
   npx -y @puppeteer/browsers install chrome@stable --path ~/chrome
   ```
   Note the printed binary path — something like `/home/<user>/chrome/chrome/linux-<version>/chrome-linux64/chrome`.
2. Copy `chrome-devtools-wsl.json` and **replace the placeholder path** in `--executablePath` with the real one from step 1.
3. The `--no-sandbox --disable-setuid-sandbox` flags are required when running Chrome in WSL — leave them in.
4. Drop into your project's `.mcp.json` and verify with `/mcp`.

### Context7

1. **Optional but recommended:** sign up for a free API key at [context7.com/dashboard](https://context7.com/dashboard) — it raises rate limits considerably.
2. Paste the key into the `CONTEXT7_API_KEY` env value in `context7.json`. If you skip the key, leave the `env` block out entirely (don't commit an empty key).
3. Drop into `.mcp.json` and verify with `/mcp`. The server exposes `resolve-library-id` (look up a library) and `get-library-docs` (fetch its current docs).

### Atlassian (Rovo MCP)

1. You need an **Atlassian Cloud site** with Jira, Confluence, or Compass that your account can access.
2. Drop in `atlassian.json`. The `type: "http"` entry plus the URL is all Claude Code needs.
3. Start Claude Code, then in chat type `/mcp` and select the Atlassian server. A browser opens for OAuth 2.1 consent — approve the scopes for the apps you want the agent to access.
4. **Workshop tip — pin the cloudId / project / space in `AGENTS.md`** to save tokens on every call. Example:
   ```markdown
   ## Atlassian Rovo MCP
   When connected to atlassian:
   - **MUST** use Jira project key = `YOURPROJ`
   - **MUST** use Confluence spaceId = `"123456"`
   - **MUST** use cloudId = `"https://yoursite.atlassian.net"` (do NOT call getAccessibleAtlassianResources)
   - **MUST** use `maxResults: 10` or `limit: 10` for ALL Jira JQL and Confluence CQL search operations.
   ```
5. **Self-hosted / Server users:** the official Rovo MCP is Cloud-only. Look at community options (e.g. `mcp/atlassian/atlassian-mcp-server`) but treat them as third-party — verify what they're allowed to do.

### GitLab

1. Requires **GitLab Duo with beta and experimental features enabled** for your GitLab instance / namespace.
2. For GitLab.com, use `gitlab.json` as-is. For **self-managed GitLab**, edit the URL to your instance: `https://<your-gitlab-host>/api/v4/mcp`.
3. Drop in `.mcp.json`.
4. Start Claude Code, type `/mcp`, select the GitLab server, complete the OAuth flow in the browser.
5. The server exposes tools for projects, issues, merge requests, pipelines, etc.

---

## Security notes

- `.mcp.json` lives at the project root and is committed to git. **Never put secrets directly in it.** Use the `env` block to reference env vars (e.g. `${CONTEXT7_API_KEY}`) — most MCP clients support env-var interpolation. The Context7 snippet above shows the inline form for clarity, but production setups should use env vars or a `.env` file that's `.gitignore`'d.
- HTTP-transport MCPs (Atlassian, GitLab) authenticate via OAuth in the browser — no token in the file. This is the safest pattern.
- For OAuth servers, **revoke access** in the provider's settings if you stop using the workshop laptop or share access with someone else.
- For team-shared `.mcp.json`, document any required env vars in the project README so a fresh clone Just Works after the env is set.

---

## What's missing

This snippet set covers the MCPs explicitly demoed or referenced in the workshop. Common omissions you might want to add for your own work:

- **GitHub MCP** (`@modelcontextprotocol/server-github`) — same shape as GitLab, for GitHub teams.
- **PostgreSQL / SQLite MCPs** — let the agent read schemas + run queries safely.
- **Playwright / Puppeteer MCPs** — heavier alternatives to Chrome DevTools-MCP if you need full browser automation.
- **Filesystem MCP** — sandboxed file ops for agents that should only touch a specific subtree.
- **Slack / Teams MCPs** — for cross-team comms automation.

Pick by the same rule: *what do you do twice a week that you'd rather the agent did, and is it worth a tool call's worth of tokens every time the agent considers using it?* Don't install MCPs you won't use — every connected server eats context-window budget.
