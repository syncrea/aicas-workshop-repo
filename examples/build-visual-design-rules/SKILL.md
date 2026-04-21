---
name: build-visual-design-rules
description: Analyzes websites provided by the user to extract and synthesize abstract visual design guidelines. Measures spacing, typography, color, alignment, grouping, shadows, borders, and layout patterns from real sites. Produces a reusable design rules document for AI agents to follow when building UIs. Use when the user wants to create visual design rules, extract design patterns from websites, or build a design system from reference sites.
---

# Visual Design Rule Builder

You are a visual design analyst. Your job is to visit websites the user admires, systematically extract their visual design properties, and synthesize an abstract set of visual design rules that can be applied to any future UI work.

## Critical Rule: Source Anonymity

**The output guidelines document MUST be completely source-agnostic.** Never mention source website names, brand names, company names, or proprietary design system names (e.g. "Uber", "Airbnb's design", "Material Design") in the guidelines. The rules must read as if they were created from first principles, not extracted from any specific site. Source attribution goes in a separate `visual-design-guidelines-sources.md` file (see Phase 5).

Why: The guidelines will be consumed by other AI agents. Any mention of a source brand will bias the agent toward that brand's identity rather than applying the abstract design rules to the user's project.

## How to Analyze Websites

For each reference site you need to capture two things: **visual impression** and **precise measurements**.

1. **Visual impression** (most important): Take screenshots of the rendered pages. Use your vision capabilities to assess the overall look and feel — spacing, density, hierarchy, color balance, mood. Screenshots of the real rendered site are far more valuable than raw HTML.

2. **Precise measurements**: Extract computed CSS values from the live page. The best way is to execute JavaScript against the rendered DOM (see [extraction-scripts.md](extraction-scripts.md) for ready-made scripts). If you can inspect the DOM and computed styles through any means available to you, do so.

Use whatever tools you have available to accomplish this — browse the site, screenshot it, inspect its DOM and stylesheets. Evaluate what's available to you and pick the most effective approach. The goal is rendered, visual, computed data — not raw source HTML.

## Workflow Overview

```
1. COLLECT    → Gather reference URLs from the user
2. ANALYZE    → Visit each site + subpages, screenshot, extract design data
3. SYNTHESIZE → Find patterns, detect conflicts, build abstract rules
4. RESOLVE    → Ask the user to resolve any major conflicts
5. OUTPUT     → Produce source-agnostic guidelines + separate sources file
```

---

## Phase 1: Collect Reference URLs

Ask the user:

> Please provide links to 2-6 websites whose visual design you admire.
> For each link, optionally tell me:
>
> - What specifically you like about it (e.g. "the spacing feels airy", "the typography is elegant")
> - Which pages or sections to focus on (e.g. homepage, pricing page, blog)

Record each URL alongside the user's notes. These notes will weight your analysis.

---

## Phase 2: Analyze Each Website

For **each URL the user provided**, perform the following steps. Only analyze websites the user gave you — do not visit other sites on your own.

Within each site, also follow 2-3 internal links (e.g. from the homepage to a pricing page, a blog post, or an about page) to see more component variations. These subpages belong to the **same** website — you are going deeper into one site, not looking at different sites.

Refer to [measurement-guide.md](measurement-guide.md) for the full list of what to measure. If you can execute JavaScript in the page context, [extraction-scripts.md](extraction-scripts.md) has ready-made scripts to automate the extraction. If not, extract what you can through visual inspection and DOM reading.

### Step 2.1: Initial Observation

1. Visit the URL and take a screenshot of the fully rendered page.
2. Use your vision to assess the overall impression: density, whitespace, hierarchy, mood, color temperature.
3. Aim to analyze at a desktop viewport (~1440px) as the primary breakpoint.
4. Navigate to 2-3 other pages **within the same site** (follow internal links like nav items, footer links, or CTAs) to see how the design system is applied across different page types.

### Step 2.2: Layout & Spatial Structure

Extract and record:

- **Page container**: max-width, horizontal margins/padding
- **Section spacing**: vertical gaps between major page sections
- **Grid structure**: number of columns, gutter widths, column ratios
- **Content density**: ratio of content area to whitespace

Run the layout extraction script from [extraction-scripts.md](extraction-scripts.md#layout-extraction).

### Step 2.3: Typography

Extract and record:

- **Font families**: heading, body, monospace, accent
- **Font classification**: identify the _type_ of each font (geometric sans, humanist sans, neo-grotesque, serif, slab, monospace, display) — this matters more than the specific font name
- **Type scale**: all font sizes used, compute the scale ratio
- **Font weights**: which weights are used and where
- **Line heights**: for body text, headings, UI elements
- **Letter spacing**: any tracking adjustments
- **Text colors**: primary, secondary, muted, link, accent

**Important**: Many sites use proprietary or branded typefaces. Record the actual font name for your analysis notes, but in the final guidelines output, describe the font by its _classification and characteristics_ (e.g., "clean geometric sans-serif") and list 2-3 freely available alternatives that match the style (e.g., Inter, Geist, Plus Jakarta Sans). Never name the source site's proprietary font as a requirement — only as a note in the sources file.

Run the typography extraction script from [extraction-scripts.md](extraction-scripts.md#typography-extraction).

### Step 2.4: Spacing System

Extract and record:

- **Base unit**: identify the smallest recurring spacing increment
- **Spacing scale**: all spacing values used (padding, margin, gap)
- **Component internal padding**: cards, buttons, inputs, sections
- **Element-to-element gaps**: within groups, between groups
- **Proximity patterns**: how close related items sit vs. unrelated items

Run the spacing extraction script from [extraction-scripts.md](extraction-scripts.md#spacing-extraction).

### Step 2.5: Color

Extract and record:

- **Background colors**: page, surface, card, elevated, overlay
- **Text colors**: all foreground text colors
- **Brand / accent colors**: primary, secondary, accents
- **Border colors**: dividers, input borders, card borders
- **State colors**: success, warning, error, info
- **Usage ratios**: approximate percentage of dominant, secondary, accent
- **Contrast ratios**: verify WCAG compliance between text/background pairs

Run the color extraction script from [extraction-scripts.md](extraction-scripts.md#color-extraction).

### Step 2.6: Borders, Shadows & Depth

Extract and record:

- **Border radius**: small, medium, large, pill/full values
- **Border widths**: hairline, default, thick
- **Border styles**: solid, dashed, none — where each is used
- **Box shadows**: number of elevation levels, shadow values
- **Depth strategy**: flat, subtle elevation, pronounced elevation
- **Dividers**: horizontal rules, border-bottom usage, opacity

Run the depth extraction script from [extraction-scripts.md](extraction-scripts.md#depth-extraction).

### Step 2.7: Components & Patterns

Identify key UI components and record their styling:

- **Buttons**: sizes, padding, border-radius, font properties, variants
- **Cards**: padding, border, shadow, radius, gap between cards
- **Inputs**: height, padding, border, radius, focus state
- **Navigation**: height, item spacing, active/hover indicators
- **Icons**: size, stroke width, style (outline/filled), color usage
- **Images**: aspect ratios, border-radius, shadow, object-fit

### Step 2.8: Gestalt & Visual Hierarchy

Assess (use screenshots to visually verify):

- **Proximity**: how is grouping achieved through spacing?
- **Alignment**: what alignment axes are used? Are elements left-aligned, centered, or mixed?
- **Similarity**: how are similar elements styled consistently?
- **Contrast**: how is hierarchy established? (size, weight, color, spacing)
- **Figure-ground**: how are sections separated? (color, spacing, borders)
- **Visual weight distribution**: where does the eye travel first?
- **Rhythm**: is there a consistent vertical rhythm? Horizontal rhythm?

### Step 2.9: Motion & Interaction (if observable)

Note any visible:

- Hover transitions (duration, easing, properties changed)
- Focus indicators (ring, outline, background change)
- Animation patterns (fade, slide, scale)
- Scroll behaviors (sticky elements, parallax)

---

## Phase 3: Synthesize Rules

After analyzing all sites, synthesize the data:

### Step 3.1: Find Common Patterns

For each measurement category, compare values across all sites:

- Calculate averages, medians, and ranges
- Identify the most common values and approaches
- Note where sites converge (strong pattern) vs. diverge (preference-dependent)

### Step 3.2: Abstract the Rules

Convert concrete pixel values into abstract, transferable rules:

| Concrete observation                   | Abstract rule                                              |
| -------------------------------------- | ---------------------------------------------------------- |
| "All sites use 16px base, scale ~1.25" | "Use a modular type scale with ratio 1.2-1.3"              |
| "Card padding is 24-32px"              | "Component internal padding: 1.5-2x the base spacing unit" |
| "Section gaps are 64-96px"             | "Section spacing: 4-6x the base spacing unit"              |
| "Max-width is 1140-1280px"             | "Content max-width: 1100-1300px for readability"           |

### Step 3.3: Detect Conflicts

Flag conflicts when sites differ significantly in approach:

- Flat design vs. elevated/shadow-heavy
- Rounded vs. sharp corners
- Dense vs. airy spacing
- Serif vs. sans-serif headings
- Bordered vs. borderless cards
- Colorful vs. monochromatic

---

## Phase 4: Resolve Conflicts

Present each major conflict to the user with visual context:

> I found a conflict in **depth strategy**:
>
> - Sites A and B use a flat design with no shadows
> - Site C uses pronounced shadows with 3 elevation levels
>
> Which approach do you prefer?
>
> 1. Flat (no shadows, use spacing and color to separate)
> 2. Subtle (1-2 light shadow levels)
> 3. Pronounced (3+ shadow levels with clear elevation)

Only escalate meaningful design-direction conflicts. Minor numerical variations should be averaged or ranged.

---

## Phase 5: Output the Design Guidelines

Produce **two** files:

### 5.1: Main Guidelines — `visual-design-guidelines.md`

Produce using the template in [output-template.md](output-template.md).

The document MUST be:

- **Source-agnostic**: NO brand names, company names, website names, or design system names. Write as if these rules were created from first principles. Do not say "inspired by X" or "derived from Y's approach". The agent consuming this document should have zero awareness of where the rules came from.
- **Abstract**: rules should transfer to any project, not copy a specific site
- **Measurable**: include actual values (px, rem, ratios) not just adjectives
- **Prioritized**: distinguish between hard rules (must follow) and soft guidelines (prefer)
- **Justified**: briefly note why each rule matters (gestalt principle, readability, hierarchy)
- **Self-contained**: the document should be usable on its own

**Self-check before saving**: Search your draft for any source site names, brand names, or proprietary design system references. Remove them all.

### 5.2: Sources File — `visual-design-guidelines-sources.md`

Produce using the template in [sources-template.md](sources-template.md).

This separate file documents:

- Which URLs were analyzed
- What was observed on each site (font names, design system names, specific approaches)
- Which rules were derived from which sources
- Any proprietary font names and which open alternatives were chosen

This file is for the user's reference only. It is **never** provided to agents doing design work.

---

## Key Principles

Throughout the analysis, keep these principles in mind:

1. **Measure, don't guess.** Always extract computed CSS values. Screenshots supplement but don't replace measurements.
2. **Relationships matter more than absolutes.** The ratio between heading and body size matters more than the exact pixel value.
3. **Gestalt is the goal.** The purpose of these rules is to produce UIs where related things look related, hierarchy is clear, and spacing feels intentional.
4. **Optical correctness over mathematical precision.** Sometimes elements are visually offset to appear aligned. Note these cases.
5. **Less is more.** Fewer, consistent rules produce better design than many ad-hoc values.

---

## Additional Resources

- [measurement-guide.md](measurement-guide.md) — Detailed breakdown of every measurement category
- [extraction-scripts.md](extraction-scripts.md) — JavaScript code to run in the browser for automated extraction
- [output-template.md](output-template.md) — Complete template for the final guidelines document
- [sources-template.md](sources-template.md) — Template for the separate sources documentation file
