# Measurement Guide

Detailed reference for every design property to extract from reference websites.

---

## 1. Layout & Spatial Structure

### Page Container

| Property             | How to measure                                   | Why it matters                               |
| -------------------- | ------------------------------------------------ | -------------------------------------------- |
| `max-width`          | Computed style on outermost content wrapper      | Defines reading line-length and content area |
| `padding-left/right` | On body or main container at various breakpoints | Page breathing room                          |
| `margin: 0 auto`     | Check if container is centered                   | Alignment strategy                           |

### Section Spacing

| Property                      | How to measure                                        | Why it matters                                  |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Vertical gap between sections | `margin-top` or `padding-top` on `<section>` elements | Establishes visual separation of content blocks |
| First section top offset      | Distance from nav/header bottom to first content      | Sets the "entry" feel of the page               |
| Footer separation             | Gap before footer                                     | Closure of the content area                     |

### Grid System

| Property            | How to measure                                | Why it matters                     |
| ------------------- | --------------------------------------------- | ---------------------------------- |
| Column count        | Count columns in multi-column layouts         | Determines density and flexibility |
| Gutter width        | `gap` or `column-gap` on grid/flex containers | Space between columns              |
| Row gap             | `row-gap` on grid containers                  | Vertical spacing in grids          |
| Column ratio        | Compare widths of sidebar vs. main content    | Proportional layout                |
| Breakpoint behavior | Resize and note when columns stack            | Responsive strategy                |

---

## 2. Typography

### Font Stack

| Property              | Where to look              | Notes                         |
| --------------------- | -------------------------- | ----------------------------- |
| Heading font-family   | `<h1>` through `<h6>`      | Often a display or serif font |
| Body font-family      | `<p>`, `<li>`, `<span>`    | Usually sans-serif for screen |
| Monospace font-family | `<code>`, `<pre>`          | Used in technical contexts    |
| UI font-family        | Buttons, labels, nav items | Sometimes differs from body   |

### Font Classification (IMPORTANT)

After identifying the font-family, classify it into one of these categories. The classification determines which alternatives to recommend in the guidelines:

| Classification      | Characteristics                         | Free alternatives                                 |
| ------------------- | --------------------------------------- | ------------------------------------------------- |
| Geometric sans      | Even strokes, circular forms, neutral   | Inter, Geist, Plus Jakarta Sans, DM Sans          |
| Humanist sans       | Calligraphic influence, warm, organic   | Source Sans Pro, Nunito, Open Sans, Lato          |
| Neo-grotesque       | Minimal contrast, uniform, industrial   | Helvetica Neue → Inter, Roboto, Switzer           |
| Serif (modern)      | Thin/thick contrast, elegant, editorial | Playfair Display, Fraunces, Lora                  |
| Serif (traditional) | Moderate contrast, readable, classic    | Merriweather, Source Serif Pro, Libre Baskerville |
| Slab serif          | Block serifs, strong, sturdy            | Roboto Slab, Zilla Slab, Bitter                   |
| Monospace           | Fixed-width, code-oriented              | JetBrains Mono, Fira Code, Source Code Pro        |
| Display/decorative  | Stylized, high personality              | Varies — match the mood, not the exact shape      |

**Rule**: In the final guidelines, describe the font by its classification and visual characteristics. List the source font ONLY in the sources file, never in the guidelines themselves. Recommend 2-3 freely available alternatives.

### Type Scale

| Element         | Properties to extract                                              |
| --------------- | ------------------------------------------------------------------ |
| `h1`            | font-size, font-weight, line-height, letter-spacing, margin-bottom |
| `h2`            | font-size, font-weight, line-height, letter-spacing, margin-bottom |
| `h3`            | font-size, font-weight, line-height, letter-spacing, margin-bottom |
| `h4`            | font-size, font-weight, line-height, letter-spacing, margin-bottom |
| `h5`/`h6`       | font-size, font-weight, line-height, letter-spacing, margin-bottom |
| Body text (`p`) | font-size, font-weight, line-height, letter-spacing                |
| Small text      | font-size (captions, footnotes, helper text)                       |
| Large text      | font-size (hero text, pull quotes, intros)                         |

### Scale Ratio Calculation

Compute: `h1 / h2`, `h2 / h3`, `h3 / body`. If these are approximately equal, there is a consistent modular scale. Common ratios:

- 1.067 (minor second)
- 1.125 (major second)
- 1.200 (minor third)
- 1.250 (major third)
- 1.333 (perfect fourth)
- 1.414 (augmented fourth)
- 1.500 (perfect fifth)
- 1.618 (golden ratio)

### Line Height Guidelines

| Context            | Typical range | Why                            |
| ------------------ | ------------- | ------------------------------ |
| Body text          | 1.4-1.7       | Readability for paragraphs     |
| Headings           | 1.1-1.3       | Tight for visual impact        |
| UI labels          | 1.2-1.4       | Compact for interface elements |
| Large display text | 0.9-1.1       | Very tight for visual drama    |

### Font Weight Usage

Record which weights appear and their context:

- Thin (100-200): usually decorative/display only
- Regular (400): body text
- Medium (500): subtle emphasis, UI labels
- Semibold (600): subheadings, navigation
- Bold (700): headings, strong emphasis
- Black (800-900): hero text, impact

---

## 3. Spacing System

### Identifying the Base Unit

1. Collect all margin, padding, and gap values from the page
2. Find the Greatest Common Divisor (GCD) or most frequent smallest value
3. Common base units: 4px, 8px (most common), 10px
4. Verify: all spacing values should be multiples of this base

### Spacing Scale

Map all observed spacing values to multiples of the base unit:

| Token name  | Multiple | Example (8px base) |
| ----------- | -------- | ------------------ |
| `space-xs`  | 0.5x     | 4px                |
| `space-sm`  | 1x       | 8px                |
| `space-md`  | 2x       | 16px               |
| `space-lg`  | 3x       | 24px               |
| `space-xl`  | 4x       | 32px               |
| `space-2xl` | 6x       | 48px               |
| `space-3xl` | 8x       | 64px               |
| `space-4xl` | 12x      | 96px               |
| `space-5xl` | 16x      | 128px              |

### Where to Measure Spacing

| Location                           | What to measure                               |
| ---------------------------------- | --------------------------------------------- |
| Inside cards/containers            | All four padding values                       |
| Between card and its children      | Gap or margin on first child                  |
| Between items in a list            | margin-bottom or gap                          |
| Between sections                   | padding-top/bottom or margin between sections |
| Between heading and paragraph      | margin-bottom on heading                      |
| Between paragraph and next element | margin-bottom on paragraph                    |
| Between icon and adjacent text     | gap or margin-left/right                      |
| Form field label to input          | margin-bottom or gap                          |
| Between form fields                | margin-bottom or gap                          |
| Button internal padding            | padding shorthand                             |
| Navigation item spacing            | gap or margin between nav items               |

---

## 4. Color

### Color Palette Extraction

| Category         | Where to find                       | CSS property            |
| ---------------- | ----------------------------------- | ----------------------- |
| Page background  | `<body>`, `<html>`                  | background-color        |
| Surface / card   | `.card`, content containers         | background-color        |
| Elevated surface | Modals, dropdowns, popovers         | background-color        |
| Primary brand    | CTAs, links, active states          | color, background-color |
| Secondary brand  | Secondary buttons, accents          | color, background-color |
| Text primary     | `<p>`, `<h1>-<h6>`                  | color                   |
| Text secondary   | Subtitles, descriptions, meta       | color                   |
| Text muted       | Placeholders, disabled, hints       | color                   |
| Border default   | Input borders, card borders         | border-color            |
| Border subtle    | Dividers, separators                | border-color, opacity   |
| Success          | Success messages, valid states      | color, background-color |
| Warning          | Warning messages                    | color, background-color |
| Error / danger   | Error messages, destructive actions | color, background-color |

### Color Relationships to Assess

- **60-30-10 rule**: Does the site follow roughly 60% dominant, 30% secondary, 10% accent?
- **Neutrals**: How many neutral shades are used? (common: 6-10 shades from near-white to near-black)
- **Saturation**: Are colors muted/desaturated or vivid/saturated?
- **Temperature**: Warm (yellow/red base) or cool (blue/green base) neutrals?
- **Dark mode indicators**: Are there CSS custom properties suggesting dark mode support?

### Contrast Verification

For each text-on-background combination:

- Compute contrast ratio
- WCAG AA requires 4.5:1 for normal text, 3:1 for large text
- Note if the site meets or fails these thresholds
- Record the actual contrast ratio

---

## 5. Borders, Shadows & Depth

### Border Radius

| Context          | Where to measure                            |
| ---------------- | ------------------------------------------- |
| Small radius     | Input fields, inline tags, badges           |
| Medium radius    | Cards, buttons, dropdowns                   |
| Large radius     | Modal dialogs, hero sections                |
| Full/pill radius | Avatar circles, pill buttons, toggle tracks |

Record the actual values and compute a radius scale (e.g., 4px, 8px, 12px, 16px, 9999px).

### Box Shadows

Extract each unique `box-shadow` value and classify:

| Level   | Typical use             | Shadow characteristics              |
| ------- | ----------------------- | ----------------------------------- |
| Level 0 | Flat elements           | none                                |
| Level 1 | Cards, subtle lift      | Small offset, low blur, low opacity |
| Level 2 | Dropdowns, hover states | Medium blur, medium opacity         |
| Level 3 | Modals, dialogs         | Large blur, larger offset           |

For each shadow, record: `offset-x`, `offset-y`, `blur-radius`, `spread-radius`, `color` (including opacity).

### Depth Strategy Classification

Based on observation, classify as:

- **Flat**: No shadows, separation via color/spacing only
- **Subtle**: 1-2 shadow levels, used sparingly
- **Layered**: 3+ shadow levels, clear elevation hierarchy
- **Mixed**: Some areas flat, others elevated

---

## 6. Component-Level Measurements

### Buttons

| Property           | Variants to check                  |
| ------------------ | ---------------------------------- |
| Height             | Small, default, large              |
| Horizontal padding | All variants                       |
| Font size          | All variants                       |
| Font weight        | All variants                       |
| Border radius      | All variants                       |
| Border width       | Outlined variant                   |
| Shadow             | If used                            |
| Icon size          | When button contains icon          |
| Icon-to-text gap   | When button contains icon and text |

### Cards

| Property                 | What to record                                |
| ------------------------ | --------------------------------------------- |
| Padding                  | Top, right, bottom, left (note if asymmetric) |
| Border                   | Width, color, style                           |
| Border radius            | All corners                                   |
| Shadow                   | Shadow value                                  |
| Background               | Background color, any gradient                |
| Gap between cards        | In grid or list layouts                       |
| Internal element spacing | Gaps between title, text, image, action area  |

### Form Inputs

| Property      | What to record                        |
| ------------- | ------------------------------------- |
| Height        | Default and variants                  |
| Padding       | Left (extra if icon), right           |
| Font size     | Input text size                       |
| Border        | Width, color, style                   |
| Border radius | All corners                           |
| Focus ring    | Color, width, offset, shadow          |
| Label style   | Size, weight, color, spacing to input |
| Helper text   | Size, color, spacing from input       |
| Error state   | Border color, text color, icon        |

### Navigation

| Property         | What to record                           |
| ---------------- | ---------------------------------------- |
| Nav height       | Total height of navbar                   |
| Logo size        | Width and/or height                      |
| Nav item font    | Size, weight, family                     |
| Nav item spacing | Gap between items                        |
| Active indicator | Underline, background, color change      |
| Hover state      | Color change, underline, background      |
| Sticky behavior  | Position: sticky/fixed, shadow on scroll |

---

## 7. Gestalt Principles Assessment

For each principle, answer these questions by analyzing the screenshot alongside the measured values:

### Proximity

- What is the ratio of intra-group spacing to inter-group spacing? (Should be at least 1:2, ideally 1:3+)
- Are related items noticeably closer than unrelated items?
- Is proximity alone sufficient to show grouping, or are borders/backgrounds also used?

### Similarity

- Are elements with the same function styled identically?
- How many visual "classes" of element exist? (fewer is usually better)
- Are interactive elements visually distinct from static elements?

### Alignment

- How many alignment axes exist on the page? (fewer is cleaner)
- Are elements snapped to a visible or implicit grid?
- Are there any optical alignment adjustments (e.g., icons offset to align with text baseline)?

### Hierarchy

- How many levels of visual hierarchy are present? (typically 3-5 is ideal)
- What means are used to create hierarchy? (size, weight, color, spacing — rank them)
- Is there a clear primary action on each section/page?

### Figure-Ground

- How are content areas distinguished from backgrounds?
- Is there clear foreground (content) vs. background (chrome) separation?
- Are cards/surfaces used to group content, or is spacing sufficient?

### Continuity & Rhythm

- Is there a consistent vertical rhythm? (Check if spacing follows a base unit)
- Do elements flow naturally left-to-right, top-to-bottom?
- Are there visual "beats" that create predictable patterns?

---

## 8. Motion & Interaction Cues

| Property            | What to observe                                                  |
| ------------------- | ---------------------------------------------------------------- |
| Transition duration | Most common: 150ms (fast), 200-300ms (normal), 400ms+ (slow)     |
| Easing function     | ease, ease-in-out, cubic-bezier — note the feel                  |
| Hover transitions   | Which properties animate? (color, background, shadow, transform) |
| Focus indicators    | Ring, outline, shadow — color and width                          |
| Loading states      | Skeleton, spinner, shimmer                                       |
| Scroll effects      | Sticky headers, reveal-on-scroll, parallax                       |

---

## 9. Responsive Considerations

Note the following at 1440px (primary), 1024px (tablet), and 768px (mobile):

| Property        | What changes                                           |
| --------------- | ------------------------------------------------------ |
| Container width | Does max-width change?                                 |
| Column count    | How many columns at each breakpoint?                   |
| Font sizes      | Do heading sizes reduce? By how much?                  |
| Spacing         | Does section spacing reduce? By what ratio?            |
| Navigation      | Does it become a hamburger/drawer? At what breakpoint? |
| Hidden elements | What gets hidden on smaller screens?                   |

Record the **ratios** of change, not just the absolute values. For example: "Heading sizes reduce by ~20% from desktop to tablet."
