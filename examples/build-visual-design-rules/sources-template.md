# Sources Template

Use this template to produce the `visual-design-guidelines-sources.md` file. This file documents where the design rules came from, for the user's reference only. It is NEVER provided to agents doing design work.

---

Begin the output document below this line:

---

```markdown
# Visual Design Guidelines — Source Analysis

> This document records which websites were analyzed and what was observed.
> It is for human reference only. Do NOT provide this file to agents consuming the visual design guidelines.

## Analyzed Sources

### Source 1: [URL]

- **Pages analyzed**: [list of pages visited, e.g., homepage, pricing, blog post]
- **Design system**: [name if identifiable, e.g., "Uses Base Web / Carbon / custom system"]
- **Typeface observed**: [actual font name, e.g., "Uber Move — a proprietary geometric sans-serif"]
  - **Mapped to guideline as**: [what the guidelines recommend instead, e.g., "Inter / Geist (geometric sans)"]
- **Notable design decisions**:
  - [e.g., "Uses sharp 0px radius on card surfaces but 8px on buttons"]
  - [e.g., "Employs overlay-based hover states (inset box-shadow) instead of background-color changes"]
  - [e.g., "Section separation achieved through spacing + background color alternation, not borders"]
- **Key values extracted**:
  - Container max-width: [value]
  - Base spacing unit: [value]
  - Section spacing: [value]
  - Type scale approach: [modular ratio or stepped]
  - Shadow levels: [count and approach]
  - Depth strategy: [flat / subtle / layered]

### Source 2: [URL]

[Same structure as above]

### Source 3: [URL]

[Same structure as above — add/remove sections as needed]

---

## Cross-Source Comparison

### Converging Patterns (strong consensus)

| Pattern                | Source 1     | Source 2     | Source 3     | Guideline Value |
| ---------------------- | ------------ | ------------ | ------------ | --------------- |
| [e.g., Base unit]      | [e.g., 8px]  | [e.g., 8px]  | [e.g., 4px]  | [e.g., 8px]     |
| [e.g., Body font size] | [e.g., 16px] | [e.g., 16px] | [e.g., 16px] | [e.g., 16px]    |
| [e.g., Default radius] | [e.g., 8px]  | [e.g., 8px]  | [e.g., 12px] | [e.g., 8px]     |

### Diverging Patterns (conflicts resolved)

| Pattern                | Source 1 | Source 2 | Source 3  | Resolution | User Choice?    |
| ---------------------- | -------- | -------- | --------- | ---------- | --------------- |
| [e.g., Depth strategy] | [flat]   | [flat]   | [layered] | [flat]     | [yes/no]        |
| [e.g., Card borders]   | [none]   | [subtle] | [none]    | [none]     | [no — majority] |

---

## Font Mapping

| Source Font       | Classification       | Guideline Recommendation | Alternatives                      |
| ----------------- | -------------------- | ------------------------ | --------------------------------- |
| [e.g., Uber Move] | Geometric sans-serif | Inter                    | Geist, Plus Jakarta Sans, DM Sans |
| [e.g., Canela]    | Modern serif         | Playfair Display         | Fraunces, Lora                    |

---

## Notes

[Any additional observations, edge cases, or context that informed the guidelines but doesn't belong in the guidelines themselves.]
```
