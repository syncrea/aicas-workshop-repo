# Reference skill — `build-visual-design-rules`

> **What this is:** a reference Claude Code **Skill** (Anthropic Skills format — `SKILL.md` + supporting files) that participants can study, install, or fork during Block 9. Unlike `examples/conventional-commit.md` (a single-file slash command) and `examples/security-reviewer.md` (a single-file subagent), this is a **multi-file skill**: the agent reads `SKILL.md` to learn the workflow, then pulls in the supporting reference docs (`measurement-guide.md`, `extraction-scripts.md`, `output-template.md`, `sources-template.md`) on demand. Use it to show participants what a non-trivial, "real-world" skill looks like once a workflow grows beyond a single prompt.
>
> **Where it lives in a real project:** `.claude/skills/build-visual-design-rules/` (project-scoped) or `~/.claude/skills/build-visual-design-rules/` (user-global). Once present, Claude Code will surface this skill automatically when the user asks for something matching the description in `SKILL.md`'s frontmatter.
>
> **Origin:** originally authored as a Cursor skill; reproduced here unchanged in workflow because the Anthropic Skills format (`SKILL.md` with YAML frontmatter + sibling reference files) is the same in both harnesses — only the install path differs.

---

# Visual Design Agent Rule Builder

A toolbox for AI agents to create abstract visual design guidelines by analyzing real websites.

## The Problem

AI agents produce visual designs that are cluttered, repetitive, and violate fundamental design principles. While AI has strong vision-language capabilities, it cannot reliably measure distances, spacing, optical corrections, or apply gestalt principles. The result: interfaces where grouping is unclear, hierarchy is weak, and spacing feels arbitrary.

## The Solution

This project provides a structured methodology for an AI agent to:

1. **Visit reference websites** the user admires
2. **Extract precise design measurements** from DOM and CSSOM (spacing, typography, color, depth, layout)
3. **Analyze visual patterns** using screenshots as verification baselines
4. **Synthesize abstract design rules** that transfer to any project
5. **Produce a reusable guidelines document** the agent follows when building UIs

The output is a `visual-design-guidelines.md` file with measurable, prioritized rules — not vague adjectives, but actual values, ratios, and constraints.

## How It Works

### Prerequisites

The AI agent needs a browser tool that can:

- Navigate to URLs and take screenshots
- Execute JavaScript in the page context
- Read DOM elements and computed CSS styles

In a Claude Code setup, this is typically **Chrome DevTools MCP** (covered in Block 5 of the workshop) or the **Playwright MCP**. Either provides the navigate / screenshot / `evaluate` JavaScript surface this skill expects.

### Workflow

```
User provides 2-6 website URLs they admire
         │
         ▼
Agent visits each site at 1440px viewport
         │
         ▼
Agent runs extraction scripts (JS) to read:
  • Layout & grid structure
  • Typography (fonts, scale, weights, line heights)
  • Spacing system (base unit, scale, component padding)
  • Color palette (backgrounds, text, borders, accents)
  • Depth (shadows, borders, border-radius)
  • Component styles (buttons, cards, inputs, nav)
         │
         ▼
Agent cross-references with screenshots for:
  • Gestalt principle assessment
  • Visual hierarchy analysis
  • Alignment and rhythm verification
  • Optical correction detection
         │
         ▼
Agent synthesizes rules across all sites
  • Averages converging patterns
  • Flags conflicts for user resolution
         │
         ▼
Agent outputs two files:
  • visual-design-guidelines.md (source-agnostic, for agents)
  • visual-design-guidelines-sources.md (attribution, for humans)
```

### Using the Output

The generated `visual-design-guidelines.md` can be:

- Committed alongside `AGENTS.md` (or referenced from it) so every agent session inherits the visual rules
- Dropped into `docs/guidelines/` next to other framework / language guidelines (the convention used in the workshop's lab repos)
- Pasted as context when asking an agent to build or review UI

**Important**: Only provide `visual-design-guidelines.md` to agents doing design work. The sources file (`visual-design-guidelines-sources.md`) is for your reference — it documents where the rules came from but should not be given to consuming agents, as source brand names can bias the output.

## Project Structure

```
├── SKILL.md                 # Main workflow — the agent follows this step by step
├── measurement-guide.md     # Detailed reference for every design property to measure
├── extraction-scripts.md    # JavaScript snippets to run in the browser for data extraction
├── output-template.md       # Template for the final visual design guidelines document
├── sources-template.md      # Template for the source attribution file (separate from guidelines)
└── README.md                # This file
```

## What Gets Measured

| Category       | Examples                                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| **Layout**     | Container max-width, grid columns, gutters, section spacing                            |
| **Typography** | Font families, type scale ratio, weights, line heights, letter spacing                 |
| **Spacing**    | Base unit, spacing scale, component padding, proximity ratios                          |
| **Color**      | Palette (background, text, border, accent, state), contrast ratios, usage distribution |
| **Depth**      | Border radius scale, shadow levels, border styles, depth strategy                      |
| **Components** | Button sizes, card padding, input styles, nav structure                                |
| **Gestalt**    | Proximity ratios, alignment axes, hierarchy levels, rhythm, figure-ground              |
| **Motion**     | Transition durations, easing, hover/focus states                                       |

## Why This Approach Works

1. **Measurement over intuition** — The agent extracts computed CSS values, not guesses. Relationships between values (ratios, multiples) are more transferable than absolute pixels.

2. **Gestalt as the goal** — The rules encode _why_ spacing matters (proximity principle, visual grouping) not just _what_ the spacing is.

3. **Abstract and transferable** — Rules like "proximity ratio 1:3" or "type scale 1.25" apply to any project, unlike copying a specific site's CSS.

4. **Conflict resolution** — When reference sites disagree, the user decides. No silent averaging of incompatible approaches.

5. **Progressive detail** — The guidelines start with philosophy and end with component-level specs, so the agent has both high-level direction and specific values.

## Installing as a Claude Code Skill

To install this as a Claude Code skill, copy or symlink this directory to one of:

```bash
# Project-scoped (only this repo can use it; commit it alongside the code)
.claude/skills/build-visual-design-rules/

# User-global (every project on your machine can use it)
~/.claude/skills/build-visual-design-rules/
```

Once present, Claude Code will surface the skill automatically when you ask for something that matches the `description` field in `SKILL.md`'s frontmatter — e.g. *"build visual design guidelines from these three sites I like"*. You can also invoke it explicitly via `/skills` and pick `build-visual-design-rules` from the list.

> **Portability note:** the same `SKILL.md` + supporting-files layout works in Cursor (`.cursor/skills/<name>/`), Open Code, and any other harness that adopts the Anthropic Skills convention. Only the install directory changes between tools — the skill content itself is portable.

## Notes for the workshop

- This sits next to `examples/conventional-commit.md` and `examples/security-reviewer.md` as a third reference artifact, illustrating the **third Block 9 layer**: a multi-file skill (vs. single-file slash command, vs. subagent). When a workflow has reference data, templates, or scripts that would bloat a single prompt, splitting into `SKILL.md` + sibling files is the right pattern.
- Note how `SKILL.md` references its supporting files by relative path (e.g. `[extraction-scripts.md](extraction-scripts.md)`). The agent only loads those files when the workflow actually reaches a step that needs them — keeping the initial context cost low while still making the deeper reference material discoverable on demand.
- The frontmatter in `SKILL.md` is **just `name` and `description`** — no `allowed-tools`, no `argument-hint`. Skills are broader than slash commands and are surfaced based on description match, not invoked with a fixed argument shape. Compare with `examples/conventional-commit.md` to see the slash-command frontmatter shape.
