# Extraction Scripts

JavaScript snippets for automated CSS/DOM extraction. Each script returns a JSON object with structured design data. These are helpers — use them if you can execute JavaScript in the page context (browser console, automation tool, or any other method). If you cannot run JS, extract the same information through visual inspection and DOM reading.

> **Usage**: Execute against the live rendered page. The scripts query computed styles, not source CSS. Aim to run at ~1440px viewport width.

---

## Layout Extraction

```javascript
(() => {
  const body = document.body;
  const bodyCS = getComputedStyle(body);

  // Find the main content container (common patterns)
  const containerSelectors = [
    'main',
    '[role="main"]',
    '.container',
    '.wrapper',
    '.content',
    '.page-wrapper',
    '.site-content',
    '.layout',
    '#content',
    '#main',
  ];
  let container = null;
  for (const sel of containerSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      container = el;
      break;
    }
  }
  // Fallback: find the widest direct child of body that isn't full-width
  if (!container) {
    container =
      [...body.children].find((el) => {
        const cs = getComputedStyle(el);
        const w = el.getBoundingClientRect().width;
        return w < window.innerWidth * 0.95 && cs.display !== 'none';
      }) || body;
  }

  const containerCS = getComputedStyle(container);
  const containerRect = container.getBoundingClientRect();

  // Sections
  const sections = document.querySelectorAll(
    'section, [class*="section"], main > div',
  );
  const sectionGaps = [];
  const sectionsList = [...sections].filter((s) => {
    const r = s.getBoundingClientRect();
    return r.height > 50 && r.width > 200;
  });
  for (let i = 1; i < sectionsList.length; i++) {
    const prev = sectionsList[i - 1].getBoundingClientRect();
    const curr = sectionsList[i].getBoundingClientRect();
    const gap = curr.top - prev.bottom;
    if (gap >= 0) sectionGaps.push(Math.round(gap));
  }

  // Grid/flex containers
  const gridContainers = document.querySelectorAll(
    '[style*="grid"], [class*="grid"]',
  );
  const flexContainers = document.querySelectorAll('[style*="flex"]');
  const grids = [];
  document.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'grid' || cs.display === 'inline-grid') {
      grids.push({
        selector:
          el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
        columns: cs.gridTemplateColumns,
        rows: cs.gridTemplateRows,
        gap: cs.gap,
        columnGap: cs.columnGap,
        rowGap: cs.rowGap,
      });
    }
    if (cs.display === 'flex' || cs.display === 'inline-flex') {
      const children = el.children.length;
      if (children >= 2) {
        grids.push({
          type: 'flex',
          selector:
            el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          direction: cs.flexDirection,
          gap: cs.gap,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent,
          childCount: children,
        });
      }
    }
  });

  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    body: {
      backgroundColor: bodyCS.backgroundColor,
      margin: bodyCS.margin,
      padding: bodyCS.padding,
    },
    container: {
      maxWidth: containerCS.maxWidth,
      width: Math.round(containerRect.width) + 'px',
      padding: containerCS.padding,
      margin: containerCS.margin,
    },
    sectionGaps: sectionGaps,
    sectionGapAverage: sectionGaps.length
      ? Math.round(sectionGaps.reduce((a, b) => a + b, 0) / sectionGaps.length)
      : null,
    layoutContainers: grids.slice(0, 20), // limit to first 20
  };
})();
```

---

## Typography Extraction

```javascript
(() => {
  const results = { fonts: new Set(), typeScale: {}, textColors: new Set() };

  // Heading styles
  for (let level = 1; level <= 6; level++) {
    const el = document.querySelector(`h${level}`);
    if (el) {
      const cs = getComputedStyle(el);
      results.typeScale[`h${level}`] = {
        fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        color: cs.color,
      };
      results.fonts.add(
        cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      );
      results.textColors.add(cs.color);
    }
  }

  // Body text
  const bodyP = document.querySelector('p');
  if (bodyP) {
    const cs = getComputedStyle(bodyP);
    results.typeScale['body'] = {
      fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
    };
    results.fonts.add(cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim());
    results.textColors.add(cs.color);
  }

  // Small/caption text
  const smallEl = document.querySelector(
    'small, .text-sm, .caption, .text-xs, .text-muted, figcaption',
  );
  if (smallEl) {
    const cs = getComputedStyle(smallEl);
    results.typeScale['small'] = {
      fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color: cs.color,
    };
  }

  // Links
  const linkEl = document.querySelector(
    'a:not([class*="btn"]):not([class*="button"])',
  );
  if (linkEl) {
    const cs = getComputedStyle(linkEl);
    results.typeScale['link'] = {
      color: cs.color,
      textDecoration: cs.textDecorationLine,
      fontWeight: cs.fontWeight,
    };
  }

  // Compute scale ratio
  const sizes = Object.entries(results.typeScale)
    .filter(([k, v]) => v.fontSize)
    .map(([k, v]) => ({ element: k, sizePx: parseFloat(v.fontSize) }))
    .sort((a, b) => b.sizePx - a.sizePx);

  const scaleRatios = [];
  for (let i = 0; i < sizes.length - 1; i++) {
    const ratio = sizes[i].sizePx / sizes[i + 1].sizePx;
    if (ratio > 1.01)
      scaleRatios.push({
        from: sizes[i + 1].element,
        to: sizes[i].element,
        ratio: Math.round(ratio * 1000) / 1000,
      });
  }

  // Button text
  const btn = document.querySelector(
    'button, [class*="btn"], [class*="button"], a[class*="btn"]',
  );
  if (btn) {
    const cs = getComputedStyle(btn);
    results.typeScale['button'] = {
      fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
    };
  }

  // Nav items
  const navItem = document.querySelector('nav a, nav button, header a');
  if (navItem) {
    const cs = getComputedStyle(navItem);
    results.typeScale['navItem'] = {
      fontFamily: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
    };
  }

  return {
    fonts: [...results.fonts],
    typeScale: results.typeScale,
    scaleRatios: scaleRatios,
    textColors: [...results.textColors],
  };
})();
```

---

## Spacing Extraction

```javascript
(() => {
  const spacingValues = [];

  // Helper to parse px values
  const px = (v) => Math.round(parseFloat(v) || 0);

  // Collect spacing from common elements
  const selectors = [
    'section',
    'main > div',
    'article',
    '.card',
    '[class*="card"]',
    'button',
    '[class*="btn"]',
    '[class*="button"]',
    'input',
    'textarea',
    'select',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'nav',
    'header',
    'footer',
    'div[class]',
  ];

  const collected = { margins: [], paddings: [], gaps: [] };
  const seen = new Set();

  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const cs = getComputedStyle(el);

      [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].forEach(
        (v) => {
          const val = px(v);
          if (val > 0 && val < 500) collected.margins.push(val);
        },
      );

      [
        cs.paddingTop,
        cs.paddingRight,
        cs.paddingBottom,
        cs.paddingLeft,
      ].forEach((v) => {
        const val = px(v);
        if (val > 0 && val < 500) collected.paddings.push(val);
      });

      if (cs.gap && cs.gap !== 'normal') {
        const val = px(cs.gap);
        if (val > 0) collected.gaps.push(val);
      }
    });
  }

  // Find frequency distribution
  const allValues = [
    ...collected.margins,
    ...collected.paddings,
    ...collected.gaps,
  ];
  const freq = {};
  allValues.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });

  // Sort by frequency
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  // Detect base unit candidates
  const values = sorted.map(([v]) => parseInt(v)).sort((a, b) => a - b);
  const gcdTwo = (a, b) => (b === 0 ? a : gcdTwo(b, a % b));
  const baseUnitCandidates =
    values.length > 1
      ? [values.reduce((a, b) => gcdTwo(a, b)), 4, 8].filter(
          (v, i, arr) => arr.indexOf(v) === i,
        )
      : [8];

  // Component-specific spacing
  const componentSpacing = {};

  // Cards
  const card = document.querySelector('.card, [class*="card"]');
  if (card) {
    const cs = getComputedStyle(card);
    componentSpacing.card = {
      padding: cs.padding,
      margin: cs.margin,
      gap: cs.gap,
    };
  }

  // Buttons
  const btn = document.querySelector(
    'button, [class*="btn"], [class*="button"]',
  );
  if (btn) {
    const cs = getComputedStyle(btn);
    componentSpacing.button = {
      paddingVertical: cs.paddingTop + ' / ' + cs.paddingBottom,
      paddingHorizontal: cs.paddingLeft + ' / ' + cs.paddingRight,
      height: btn.getBoundingClientRect().height + 'px',
    };
  }

  // Inputs
  const input = document.querySelector(
    'input[type="text"], input[type="email"], input:not([type])',
  );
  if (input) {
    const cs = getComputedStyle(input);
    componentSpacing.input = {
      padding: cs.padding,
      height: input.getBoundingClientRect().height + 'px',
    };
  }

  // Navigation
  const nav = document.querySelector('nav, header');
  if (nav) {
    const cs = getComputedStyle(nav);
    componentSpacing.nav = {
      height: nav.getBoundingClientRect().height + 'px',
      padding: cs.padding,
    };
    // Nav item gaps
    const navLinks = nav.querySelectorAll('a, button');
    if (navLinks.length >= 2) {
      const rects = [...navLinks].map((l) => l.getBoundingClientRect());
      const navGaps = [];
      for (let i = 1; i < rects.length && i < 8; i++) {
        const gap = Math.round(rects[i].left - rects[i - 1].right);
        if (gap > 0 && gap < 200) navGaps.push(gap);
      }
      componentSpacing.navItemGaps = navGaps;
    }
  }

  return {
    spacingFrequency: sorted.map(([v, count]) => ({
      value: parseInt(v),
      count,
    })),
    baseUnitCandidates,
    componentSpacing,
    summary: {
      totalMarginsCollected: collected.margins.length,
      totalPaddingsCollected: collected.paddings.length,
      totalGapsCollected: collected.gaps.length,
    },
  };
})();
```

---

## Color Extraction

```javascript
(() => {
  const colors = {
    backgrounds: new Map(),
    textColors: new Map(),
    borderColors: new Map(),
    allColors: new Map(),
  };

  const parseColor = (c) => {
    if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return null;
    return c;
  };

  const addColor = (map, color, context) => {
    if (!color) return;
    const existing = map.get(color);
    if (existing) {
      existing.count++;
      if (!existing.contexts.includes(context)) existing.contexts.push(context);
    } else {
      map.set(color, { color, count: 1, contexts: [context] });
    }
  };

  // Body/html backgrounds
  const bodyBg = parseColor(getComputedStyle(document.body).backgroundColor);
  const htmlBg = parseColor(
    getComputedStyle(document.documentElement).backgroundColor,
  );
  if (bodyBg) addColor(colors.backgrounds, bodyBg, 'body');
  if (htmlBg) addColor(colors.backgrounds, htmlBg, 'html');

  // Sample elements
  const elements = document.querySelectorAll('*');
  const sampled = new Set();
  let count = 0;

  elements.forEach((el) => {
    if (count > 500) return; // limit sampling
    const tag = el.tagName.toLowerCase();
    const cls = el.className?.toString().split(' ')[0] || '';
    const key = tag + '.' + cls;
    if (sampled.has(key)) return;
    sampled.add(key);
    count++;

    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const bg = parseColor(cs.backgroundColor);
    const fg = parseColor(cs.color);
    const border = parseColor(cs.borderColor);
    const context = tag + (cls ? `.${cls}` : '');

    if (bg) addColor(colors.backgrounds, bg, context);
    if (fg) addColor(colors.textColors, fg, context);
    if (border && cs.borderWidth !== '0px' && border !== bg) {
      addColor(colors.borderColors, border, context);
    }
  });

  // CSS custom properties (design tokens)
  const rootStyles = getComputedStyle(document.documentElement);
  const customProperties = {};
  try {
    const sheets = [...document.styleSheets];
    for (const sheet of sheets) {
      try {
        const rules = [...sheet.cssRules];
        for (const rule of rules) {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            const text = rule.cssText;
            const varMatches = text.matchAll(/--([\w-]+)\s*:\s*([^;]+)/g);
            for (const match of varMatches) {
              const name = match[1];
              const value = match[2].trim();
              if (value.match(/^(#|rgb|hsl|oklch|color)/)) {
                customProperties[`--${name}`] = value;
              }
            }
          }
        }
      } catch (e) {
        /* cross-origin stylesheet, skip */
      }
    }
  } catch (e) {}

  // Sort by frequency
  const sortMap = (map) =>
    [...map.values()].sort((a, b) => b.count - a.count).slice(0, 15);

  return {
    backgrounds: sortMap(colors.backgrounds),
    textColors: sortMap(colors.textColors),
    borderColors: sortMap(colors.borderColors),
    cssCustomProperties: customProperties,
    meta: { elementssampled: count },
  };
})();
```

---

## Depth Extraction

```javascript
(() => {
  const shadows = new Map();
  const radii = new Map();
  const borders = new Map();

  document.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const tag = el.tagName.toLowerCase();
    const cls = el.className?.toString().split(' ')[0] || '';
    const context = tag + (cls ? `.${cls}` : '');

    // Shadows
    const shadow = cs.boxShadow;
    if (shadow && shadow !== 'none') {
      const existing = shadows.get(shadow);
      if (existing) {
        existing.count++;
        if (existing.contexts.length < 3) existing.contexts.push(context);
      } else {
        shadows.set(shadow, { value: shadow, count: 1, contexts: [context] });
      }
    }

    // Border radius
    const radius = cs.borderRadius;
    if (radius && radius !== '0px') {
      const existing = radii.get(radius);
      if (existing) {
        existing.count++;
        if (existing.contexts.length < 3) existing.contexts.push(context);
      } else {
        radii.set(radius, { value: radius, count: 1, contexts: [context] });
      }
    }

    // Borders
    const bw = cs.borderWidth;
    const bs = cs.borderStyle;
    const bc = cs.borderColor;
    if (bw !== '0px' && bs !== 'none') {
      const borderKey = `${bw} ${bs} ${bc}`;
      const existing = borders.get(borderKey);
      if (existing) {
        existing.count++;
      } else {
        borders.set(borderKey, { width: bw, style: bs, color: bc, count: 1 });
      }
    }
  });

  // Classify depth strategy
  const shadowCount = shadows.size;
  const totalShadowUsage = [...shadows.values()].reduce(
    (a, b) => a + b.count,
    0,
  );
  let depthStrategy;
  if (shadowCount === 0) depthStrategy = 'flat';
  else if (shadowCount <= 2 && totalShadowUsage < 20) depthStrategy = 'subtle';
  else if (shadowCount <= 2) depthStrategy = 'subtle-consistent';
  else depthStrategy = 'layered';

  return {
    shadows: [...shadows.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    borderRadii: [...radii.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    borders: [...borders.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    depthStrategy,
    summary: {
      uniqueShadows: shadowCount,
      uniqueRadii: radii.size,
      uniqueBorders: borders.size,
    },
  };
})();
```

---

## Full-Page Component Survey

Run this for a high-level overview of all visible components and their key styles:

```javascript
(() => {
  const survey = {};

  // Buttons
  const buttons = document.querySelectorAll(
    'button, [class*="btn"], [class*="button"], a[class*="btn"]',
  );
  survey.buttons = [
    ...new Set(
      [...buttons]
        .map((b) => {
          const cs = getComputedStyle(b);
          const rect = b.getBoundingClientRect();
          if (rect.width === 0) return null;
          return JSON.stringify({
            text: b.textContent.trim().slice(0, 30),
            height: Math.round(rect.height),
            padding: cs.padding,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            borderRadius: cs.borderRadius,
            backgroundColor: cs.backgroundColor,
            color: cs.color,
            border: cs.border,
            boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null,
          });
        })
        .filter(Boolean),
    ),
  ]
    .map((s) => JSON.parse(s))
    .slice(0, 8);

  // Images
  const images = document.querySelectorAll('img');
  survey.images = [...images].slice(0, 5).map((img) => {
    const cs = getComputedStyle(img);
    const rect = img.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      aspectRatio: Math.round((rect.width / rect.height) * 100) / 100,
      borderRadius: cs.borderRadius,
      objectFit: cs.objectFit,
      boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null,
    };
  });

  // Icons (SVGs and icon fonts)
  const svgs = document.querySelectorAll('svg');
  survey.icons = [...svgs].slice(0, 5).map((svg) => {
    const rect = svg.getBoundingClientRect();
    const cs = getComputedStyle(svg);
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      stroke: cs.stroke !== 'none' ? cs.stroke : null,
      strokeWidth: cs.strokeWidth,
      fill: cs.fill !== 'none' ? cs.fill : null,
    };
  });

  // Lists
  const lists = document.querySelectorAll('ul, ol');
  survey.lists = [...lists].slice(0, 3).map((list) => {
    const cs = getComputedStyle(list);
    const items = list.querySelectorAll(':scope > li');
    const itemGaps = [];
    const itemRects = [...items].map((li) => li.getBoundingClientRect());
    for (let i = 1; i < itemRects.length && i < 6; i++) {
      itemGaps.push(Math.round(itemRects[i].top - itemRects[i - 1].bottom));
    }
    return {
      padding: cs.padding,
      listStyle: cs.listStyleType,
      itemCount: items.length,
      itemGaps,
    };
  });

  return survey;
})();
```

---

## Tips for Using These Scripts

1. **Run in order**: Layout first, then typography, spacing, color, depth. Each builds context for the next.
2. **Run at 1440px viewport**: Set the browser viewport to 1440px width before running.
3. **Re-run on subpages**: If the user specified particular pages, navigate there and re-run relevant scripts.
4. **Cross-origin limitations**: Scripts cannot access styles from cross-origin stylesheets. If results are sparse, the site may use an external CSS file. Fall back to visual inspection from screenshots.
5. **Dynamic content**: Some sites load content lazily. Scroll the full page before running scripts to ensure all elements are in the DOM.
6. **SPAs**: For single-page applications, wait for client-side rendering to complete before extracting.
7. **Cookie banners/modals**: Dismiss these before extraction to avoid polluting the data.
