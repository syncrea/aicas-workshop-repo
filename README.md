# AI Coding Supervisor — Workshop Repository

This is the umbrella repository for the **"How to Become an AI Coding Supervisor"** 2-day workshop. Participants clone it once and use it across both days.

```bash
git clone https://github.com/syncrea/aicas-workshop-repo.git
```

> **For workshop participants:** before Day 1, follow [`setup/environment-setup.md`](setup/environment-setup.md) to install Claude Code and point it at MiniMax-M2.7-highspeed. Once that works, you don't need to do anything else here — your facilitator will tell you which lab to open and when.

---

## How to use this repository

Each hands-on block of the workshop has its own **fully isolated lab folder** under [`labs/`](labs/). When the facilitator says *"open the Block 3 lab"*:

1. Open **only that lab's folder** in VSCode (`File → Open Folder…`), not the umbrella root.
2. Start Claude Code from inside that folder (`cd labs/<lab-name> && claude`).
3. The agent's context is then scoped to that lab — no leakage from neighbouring labs, no parent `AGENTS.md` polluting the experience.

This isolation is deliberate. Several labs ship with (or deliberately *without*) context files, planted issues, and specific git histories that only make sense inside their own folder.

---

## Repository layout

```
.
├── README.md                       — you are here
├── WIP-WORKSHOP-UMBRELLA.md        — build plan / TODO for the workshop authors
├── setup/                          — pre-workshop environment setup
├── labs/                           — one folder per hands-on block (open these in VSCode standalone)
├── exercises/                      — exercise prompts for blocks that don't have a code lab
├── references/                     — reference artifacts (e.g. "what good looks like" AGENTS.md)
├── examples/                       — reference skills/subagents participants build during the workshop
├── mcp-snippets/                   — pre-tested .mcp.json fragments per MCP server
├── openspec-feature-briefs/        — three feature briefs for the Block 7 OpenSpec hands-on
└── worksheets/                     — printable worksheets (self-assessment, integration plan, …)
```

---

## Block → folder map

| Block | What participants do | Folder to open |
|-------|----------------------|----------------|
| 1 — Opening & Framing | Self-assessment + intros (in workshop Google Doc) | — |
| 2 — Plan vs. Execute | Build a tiny Angular todo app from scratch in a blank folder | a blank folder of their own choosing (no prepared code) |
| 3 — Spot the Vibe-Coding Patterns + Intervene | Review a deliberately vibe-coded commit, then run a search-feature task | `labs/lab1-contact-list/` |
| 4 — Build AGENTS.md for the Contact App | Author AGENTS.md for the same contact app | `labs/lab1-contact-list/` |
| 5 — MCP: Codanna | Index `angular/angular` with Codanna and ask the agent semantic questions | a fresh clone of `angular/angular` (no workshop lab folder — see [`mcp-snippets/README.md`](mcp-snippets/README.md) → *"Block 5 walkthrough on `angular/angular`"*) |
| 5 — MCP: Chrome DevTools | Find and fix a visible UI bug using browser inspection | `labs/lab2-chrome-devtools-bug/` |
| 6 — Nx Monorepo Context Lab | Discover gaps in a layered context set, enhance docs/, optionally create `VISUAL-STYLEGUIDE.md` | `labs/lab3-nx-monorepo/` |
| 7 — OpenSpec | Propose, refine, apply a feature on the same Nx monorepo | `labs/lab3-nx-monorepo/` |
| 8 — Build Your Own | Assemble a full harness on participant's own project + stack | a fresh repo of their own — see `exercises/block8-build-your-own.md` |
| 9 — Custom Skills | Build `/conventional-commit` skill, test it against your own current uncommitted changes | any lab folder you have open (no dedicated sandbox — reference: [`examples/conventional-commit.md`](examples/conventional-commit.md)) |
| 9 — Custom Subagents | Build a security-reviewer subagent and test it against a planted snippet | `labs/lab4-security-snippet/` |
| 10 — Team Integration Plan | Fill in the personal worksheet | `worksheets/integration-plan.md` |
| 11 — Closing | — | — |

---

## For the workshop authors

See [`WIP-WORKSHOP-UMBRELLA.md`](WIP-WORKSHOP-UMBRELLA.md) for the build plan, open decisions, and the order in which the labs will be created.
