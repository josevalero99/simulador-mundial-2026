---
name: Responsive breakpoints
description: Design breakpoints for Bionta — desktop 1440, tablet 768, mobile 375
type: project
---

Bionta uses three responsive breakpoints in Figma and code:

- **Desktop**: 1440px (fluid above; content is responsive auto-layout)
- **Tablet**: 768px (iPad portrait)
- **Mobile**: 375px (iPhone SE / 13 mini — most defensive choice; works on 390+)

**Why:** Decided 2026-04-26 when applying responsive auto-layout to `Home v2 — Migrated`. 375px chosen over 390 to guarantee fit on smaller iPhones still in market.

**How to apply:** Frame copies named `[Screen] — Mobile` (375), `[Screen] — Tablet` (768), and the original at 1440.

Mobile-specific patterns:
- Multi-card grids → 1 column stack OR horizontal scroll carousel (1.2 cards visible) for product/social-proof rows
- Side-by-side layouts (image+info, comparison panes) → vertical stack
- Nav → hamburger
- Section padding lateral: 16-20px (vs 120px desktop, 32-48px tablet)
