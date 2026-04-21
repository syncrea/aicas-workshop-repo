# Output Template

Use this template to produce the final visual design guidelines document. Replace all bracketed placeholders with the synthesized rules from your analysis. Remove any sections that are not relevant to the analyzed sites.

## CRITICAL: Source Anonymity Rules

Before writing the output, internalize these rules:

1. **NEVER** mention source website names, brand names, or company names (e.g. "Uber", "Airbnb", "Stripe", "Apple")
2. **NEVER** mention proprietary design system names (e.g. "Base Web", "Polaris", "Carbon", "Material")
3. **NEVER** write phrases like "inspired by X", "derived from X's design", "X uses this approach"
4. **NEVER** name proprietary typefaces as requirements — classify the font type and list open alternatives
5. **DO** write all rules as if they were universal design principles you're establishing from scratch
6. **DO** use generic labels when referring to the analysis: "the reference sites", "the analyzed designs" — or better yet, just state the rule without attribution

**Self-check**: After drafting, search for any proper nouns. If you find source names, rewrite those sentences.

---

Begin the output document below this line:

---

```markdown
# Visual Design Guidelines

> Date: [date]
> Viewport reference: 1440px

These guidelines define the visual design rules for this project. All spacing, sizing, and proportional values are intentional. Follow them to produce interfaces that feel cohesive, well-spaced, and visually balanced.

---

## 1. Design Philosophy

[2-3 sentences summarizing the overall visual character. Do NOT mention source sites. Write as a design direction statement. Example: "The design favors generous whitespace, restrained color usage, and clear typographic hierarchy. Depth is achieved through subtle shadows rather than borders. The overall feel is clean, modern, and confident."]

**Key attributes**: [e.g., airy / dense, flat / elevated, rounded / sharp, minimal / decorative, warm / cool]

---

## 2. Visual Design Principles

These universal principles underpin every rule in this document. When the specific rules below don't cover a situation, fall back to these fundamentals.

**Proximity** — Elements that are close together are perceived as a group. Use tight spacing within groups and generous spacing between groups. The ratio matters: inter-group spacing should be at least 2-3x the intra-group spacing, or grouping becomes ambiguous.

**Similarity** — Elements that look alike are perceived as related. Consistent styling (color, size, shape, weight) signals that things serve the same function. Inconsistency signals difference — use it intentionally, never accidentally.

**Alignment** — Elements sharing an alignment axis feel connected and organized. Minimize the number of alignment axes on a page. Every element should sit on a deliberate alignment edge, never float arbitrarily.

**Hierarchy** — The eye needs a clear reading order. Establish importance through size first, then weight, then color. Every page or section should have exactly one primary visual entry point. Limit to 3-4 distinct levels of hierarchy.

**Figure-Ground** — Every element must read clearly as foreground (content) or background (context). Separate them through contrast, spacing, or surface changes — but pick one method, not all three at once.

**Repetition & Consistency** — Reuse the same patterns, spacing values, colors, and component styles throughout. Repetition creates rhythm and predictability. Break a pattern only when you want to draw attention.

**White Space** — Empty space is an active design element, not leftover area. It directs focus, separates groups, and gives the eye rest. Resist the urge to fill it. Generous whitespace signals confidence and clarity.

**Contrast & Restraint** — Use contrast (size, color, weight) to draw attention to what matters most. But restraint amplifies contrast: when everything is bold, nothing is bold. Default to quiet; elevate selectively.

**Optical Correctness** — Mathematical centering and equal spacing don't always _look_ centered or equal. Trust visual appearance over pixel measurements. A circle needs to be slightly larger than a square to appear the same size. Text with ascenders needs different vertical centering than text without.

---

## 3. Layout

### Page Container

- **Max width**: [e.g., 1200px]
- **Horizontal padding**: [e.g., 24px on mobile, 48px on tablet, 64px on desktop]
- **Centering**: [e.g., margin: 0 auto]

### Grid System

- **Columns**: [e.g., 12-column grid]
- **Gutter width**: [e.g., 24px / 32px]
- **Column behavior**: [e.g., "Use 1 column on mobile, 2 on tablet, 3-4 on desktop"]

### Section Spacing

- **Between major sections**: [e.g., 80-120px vertical spacing]
- **Between subsections**: [e.g., 48-64px]
- **Section internal padding**: [e.g., 64px top/bottom]

### Content Width

- **Prose / reading content**: [e.g., max-width 680px for optimal line length]
- **Full-width sections**: [e.g., allowed for hero, CTAs, full-bleed images]

---

## 4. Spacing System

### Base Unit

- **Base**: [e.g., 8px]
- **All spacing values MUST be multiples of the base unit**

### Spacing Scale

| Token | Value         | Usage                                  |
| ----- | ------------- | -------------------------------------- |
| `xs`  | [e.g., 4px]   | Icon-to-text gap, tight inline spacing |
| `sm`  | [e.g., 8px]   | Between related inline elements        |
| `md`  | [e.g., 16px]  | Default padding, paragraph spacing     |
| `lg`  | [e.g., 24px]  | Card padding, group spacing            |
| `xl`  | [e.g., 32px]  | Between distinct groups                |
| `2xl` | [e.g., 48px]  | Subsection spacing                     |
| `3xl` | [e.g., 64px]  | Section spacing                        |
| `4xl` | [e.g., 96px]  | Major section breaks                   |
| `5xl` | [e.g., 128px] | Hero/page-level spacing                |

### Spacing Rules

- **Proximity principle**: Related elements use `sm`-`md` spacing. Unrelated groups use `xl`+ spacing. The ratio of intra-group to inter-group spacing should be at least 1:[e.g., 3].
- **Heading-to-body distance**: [e.g., `md` (16px) — close to signal they belong together]
- **Body-to-next-section distance**: [e.g., `2xl` (48px) — far to signal separation]
- **Component internal padding**: [e.g., `lg` (24px) for cards, `md` (16px) for compact components]
- **Consistent axis**: [e.g., "All vertical spacing follows the scale. Never use arbitrary values."]

---

## 5. Typography

### Font Classification

**Style**: [e.g., "Clean geometric sans-serif — neutral character, even stroke widths, generous x-height, round terminals."]

> The specific font is less important than matching the classification. Any clean [geometric/humanist/neo-grotesque] sans-serif with similar x-height and proportions will produce the intended feel.

### Font Stack

| Role        | Recommended Font       | Alternatives                       | Fallback              |
| ----------- | ---------------------- | ---------------------------------- | --------------------- |
| Headings    | [e.g., Inter]          | [e.g., Geist, Plus Jakarta Sans]   | system-ui, sans-serif |
| Body        | [e.g., Inter]          | [e.g., Geist, Plus Jakarta Sans]   | system-ui, sans-serif |
| Monospace   | [e.g., JetBrains Mono] | [e.g., Fira Code, Source Code Pro] | monospace             |
| UI / Labels | [e.g., same as body]   | —                                  | —                     |

### Type Scale

- **Scale ratio**: [e.g., 1.250 (Major Third)]
- **Base size**: [e.g., 16px]

| Element        | Size         | Weight      | Line Height  | Letter Spacing  | Margin Bottom |
| -------------- | ------------ | ----------- | ------------ | --------------- | ------------- |
| Display / Hero | [e.g., 48px] | [e.g., 700] | [e.g., 1.1]  | [e.g., -0.02em] | [e.g., 24px]  |
| H1             | [e.g., 36px] | [e.g., 700] | [e.g., 1.2]  | [e.g., -0.01em] | [e.g., 16px]  |
| H2             | [e.g., 28px] | [e.g., 600] | [e.g., 1.25] | [e.g., normal]  | [e.g., 12px]  |
| H3             | [e.g., 22px] | [e.g., 600] | [e.g., 1.3]  | [e.g., normal]  | [e.g., 8px]   |
| H4             | [e.g., 18px] | [e.g., 600] | [e.g., 1.35] | [e.g., normal]  | [e.g., 8px]   |
| Body           | [e.g., 16px] | [e.g., 400] | [e.g., 1.6]  | [e.g., normal]  | [e.g., 16px]  |
| Body small     | [e.g., 14px] | [e.g., 400] | [e.g., 1.5]  | [e.g., normal]  | —             |
| Caption        | [e.g., 12px] | [e.g., 400] | [e.g., 1.4]  | [e.g., 0.01em]  | —             |
| Overline       | [e.g., 11px] | [e.g., 600] | [e.g., 1.4]  | [e.g., 0.08em]  | —             |

### Typography Rules

- **Never use more than [e.g., 3] font weights on a single page**
- **Heading letter-spacing**: [e.g., "Tighten slightly (-0.01 to -0.02em) above 24px"]
- **Body text max-width**: [e.g., "55-75 characters per line (~680px at 16px)"]
- **Text hierarchy levels**: [e.g., "Limit to 4 distinct levels: heading, subheading, body, caption"]
- **Uppercase text**: [e.g., "Only for overlines and labels, always with increased letter-spacing (0.05-0.1em)"]

---

## 6. Color

### Palette

| Role                 | Color           | Usage                         |
| -------------------- | --------------- | ----------------------------- |
| Background primary   | [e.g., #FFFFFF] | Page background               |
| Background secondary | [e.g., #F8F9FA] | Alternate sections, sidebars  |
| Surface              | [e.g., #FFFFFF] | Cards, elevated containers    |
| Primary              | [e.g., #2563EB] | CTAs, links, active states    |
| Primary hover        | [e.g., #1D4ED8] | Primary interactive hover     |
| Secondary            | [e.g., #6B7280] | Secondary actions             |
| Text primary         | [e.g., #111827] | Headings, body text           |
| Text secondary       | [e.g., #6B7280] | Descriptions, meta text       |
| Text muted           | [e.g., #9CA3AF] | Placeholders, disabled, hints |
| Border default       | [e.g., #E5E7EB] | Input borders, card borders   |
| Border subtle        | [e.g., #F3F4F6] | Dividers, separators          |
| Success              | [e.g., #059669] | Success states                |
| Warning              | [e.g., #D97706] | Warning states                |
| Error                | [e.g., #DC2626] | Error states, destructive     |

### Color Rules

- **60-30-10 distribution**: [e.g., "60% background/surface, 30% text/secondary, 10% primary accent"]
- **Neutral temperature**: [e.g., "Cool neutrals (blue-gray base)"]
- **Saturation level**: [e.g., "Muted/desaturated — avoid vivid colors except for primary CTA"]
- **Contrast requirements**: [e.g., "All text meets WCAG AA (4.5:1 normal, 3:1 large). Primary on white: [ratio]."]
- **Color usage restraint**: [e.g., "Use color sparingly and intentionally. Default to neutrals; color indicates interaction or state."]

---

## 7. Borders, Shadows & Depth

### Border Radius Scale

| Token  | Value        | Usage                               |
| ------ | ------------ | ----------------------------------- |
| `none` | 0px          | Sharp-cornered elements when needed |
| `sm`   | [e.g., 4px]  | Badges, tags, small inputs          |
| `md`   | [e.g., 8px]  | Buttons, inputs, cards              |
| `lg`   | [e.g., 12px] | Large cards, dialogs, sections      |
| `xl`   | [e.g., 16px] | Hero elements, featured cards       |
| `full` | 9999px       | Avatars, pill buttons, toggles      |

### Borders

- **Default border**: [e.g., 1px solid border-default color]
- **Usage rule**: [e.g., "Prefer spacing and background color over borders for separation. Use borders only for interactive elements (inputs, outlined buttons) and explicit content boundaries."]
- **Dividers**: [e.g., "Use a 1px border-subtle line or spacing alone. Never use thick dividers."]

### Shadow Scale

| Level       | Value                               | Usage                     |
| ----------- | ----------------------------------- | ------------------------- |
| `shadow-sm` | [e.g., 0 1px 2px rgba(0,0,0,0.05)]  | Subtle lift for cards     |
| `shadow-md` | [e.g., 0 4px 6px rgba(0,0,0,0.07)]  | Elevated cards, dropdowns |
| `shadow-lg` | [e.g., 0 10px 25px rgba(0,0,0,0.1)] | Modals, popovers, dialogs |

### Depth Strategy

- **Approach**: [e.g., "Subtle — use 1-2 shadow levels sparingly. Most elements are flat. Elevation is reserved for interactive overlays and focus states."]
- **Do NOT**: [e.g., "Apply shadows to every card. Use shadows instead of proper spacing."]

---

## 8. Components

### Buttons

| Variant   | Height       | Padding (h)  | Font Size    | Weight      | Radius     | Shadow     |
| --------- | ------------ | ------------ | ------------ | ----------- | ---------- | ---------- |
| Primary   | [e.g., 40px] | [e.g., 20px] | [e.g., 14px] | [e.g., 500] | [e.g., md] | [e.g., sm] |
| Secondary | [e.g., 40px] | [e.g., 20px] | [e.g., 14px] | [e.g., 500] | [e.g., md] | none       |
| Ghost     | [e.g., 40px] | [e.g., 20px] | [e.g., 14px] | [e.g., 500] | [e.g., md] | none       |
| Small     | [e.g., 32px] | [e.g., 12px] | [e.g., 13px] | [e.g., 500] | [e.g., sm] | none       |
| Large     | [e.g., 48px] | [e.g., 24px] | [e.g., 16px] | [e.g., 500] | [e.g., md] | [e.g., sm] |

- **Icon-only button**: [e.g., "Square aspect ratio, icon centered, same height as text button"]
- **Icon + text gap**: [e.g., "8px between icon and label"]

### Cards

- **Padding**: [e.g., 24px all sides]
- **Border**: [e.g., 1px solid border-subtle or none]
- **Radius**: [e.g., md (8px)]
- **Shadow**: [e.g., shadow-sm or none]
- **Background**: [e.g., surface color]
- **Gap between cards**: [e.g., 24px]
- **Internal spacing**: [e.g., "16px between image and title, 8px between title and description, 16px before action area"]

### Form Inputs

- **Height**: [e.g., 40px]
- **Padding**: [e.g., 0 12px]
- **Font size**: [e.g., 14px-16px]
- **Border**: [e.g., 1px solid border-default]
- **Radius**: [e.g., md (8px)]
- **Focus ring**: [e.g., "2px ring in primary color with 2px offset"]
- **Label spacing**: [e.g., "Label is 14px/500, 6px above input"]
- **Error state**: [e.g., "Border turns error color, helper text in error color below"]

### Navigation

- **Height**: [e.g., 64px]
- **Item font**: [e.g., 14px, weight 500]
- **Item gap**: [e.g., 32px]
- **Active indicator**: [e.g., "Color change + underline offset 4px"]
- **Sticky behavior**: [e.g., "Fixed top, adds shadow-sm on scroll"]

---

## 9. Icons

- **Style**: [e.g., outline / filled / duotone]
- **Default size**: [e.g., 20px in UI, 24px standalone]
- **Stroke width**: [e.g., 1.5px]
- **Color**: [e.g., "Same as adjacent text, or text-secondary"]
- **Touch target**: [e.g., "Minimum 44x44px clickable area even if icon is smaller"]

---

## 10. Images & Media

- **Border radius**: [e.g., md (8px)]
- **Aspect ratios**: [e.g., "Hero: 16:9, Thumbnails: 1:1 or 4:3"]
- **Object fit**: [e.g., cover]
- **Shadow**: [e.g., none or shadow-sm]
- **Caption style**: [e.g., "Caption text, text-secondary, mt-sm"]

---

## 11. Gestalt & Composition Rules

These rules apply the universal principles from Section 2 to this project's specific values. They are the most important project-specific rules — they ensure the design feels intentional and cohesive.

### Proximity

- [e.g., "Intra-group spacing is 8-16px. Inter-group spacing is 32-48px. The ratio must be at least 1:3 to make grouping clear."]
- [e.g., "A heading must be closer to its following content (16px) than to the preceding section (48px+)."]

### Alignment

- [e.g., "Maximum 2 alignment axes per layout section (typically left edge and right edge of the content container)."]
- [e.g., "All text in a card aligns to the same left edge."]
- [e.g., "Center alignment is reserved for hero sections, empty states, and single CTAs. Never center-align body text paragraphs."]

### Hierarchy

- [e.g., "Establish hierarchy through: 1) size, 2) weight, 3) color, in that priority order."]
- [e.g., "Each page/section must have exactly one primary visual anchor (the first thing the eye sees)."]
- [e.g., "Limit to 4 levels: primary heading, secondary heading, body, meta/caption."]

### Rhythm

- [e.g., "Vertical rhythm follows the spacing scale — no arbitrary values."]
- [e.g., "Horizontal rhythm follows the grid gutters."]
- [e.g., "Repeating elements (cards, list items) have identical spacing and sizing."]

### Similarity

- [e.g., "All clickable elements share visual traits: color, cursor, hover state."]
- [e.g., "All non-interactive text uses neutral colors."]
- [e.g., "Similar components in a group are visually identical — no subtle variations."]

### Figure-Ground

- [e.g., "Content sits on surface colors. Background sections use background-secondary to alternate."]
- [e.g., "Do not use borders + shadows + background change simultaneously — pick one method of separation."]

### White Space

- [e.g., "White space is a design element, not empty space. Do not fill it."]
- [e.g., "Minimum 40% of the viewport should be whitespace on content pages."]
- [e.g., "Hero sections use generous padding (96-128px vertical) to create breathing room."]

---

## 12. Motion & Interaction

- **Default transition**: [e.g., "150-200ms ease-out for color/opacity, 200-300ms ease-out for transform/layout"]
- **Hover effects**: [e.g., "Subtle: darken 5%, or shift shadow. No dramatic size/position changes."]
- **Focus visible**: [e.g., "2px solid primary ring with 2px offset. Always visible for keyboard navigation."]
- **Avoid**: [e.g., "Bounce, excessive scale, slow animations (>400ms), animation on page load for content blocks"]

---

## 13. Responsive Rules

- **Breakpoints**: [e.g., "sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px"]
- **Font size reduction**: [e.g., "Headings reduce by 20-30% from desktop to mobile. Body stays 16px."]
- **Spacing reduction**: [e.g., "Section spacing reduces by ~40% on mobile. Component padding stays the same."]
- **Column collapsing**: [e.g., "4 cols → 2 cols at md → 1 col at sm"]
- **Touch targets**: [e.g., "Minimum 44px height for all interactive elements on mobile"]

---

## Quick Reference Card

For rapid application, here are the most critical values:

| Property                 | Value                              |
| ------------------------ | ---------------------------------- |
| Base spacing unit        | [e.g., 8px]                        |
| Content max-width        | [e.g., 1200px]                     |
| Body font                | [e.g., Inter, 16px/1.6]            |
| Heading font             | [e.g., Inter, 700]                 |
| Type scale ratio         | [e.g., 1.25]                       |
| Primary color            | [e.g., #2563EB]                    |
| Default radius           | [e.g., 8px]                        |
| Default shadow           | [e.g., 0 1px 2px rgba(0,0,0,0.05)] |
| Default transition       | [e.g., 150ms ease-out]             |
| Proximity ratio (in:out) | [e.g., 1:3]                        |
```
