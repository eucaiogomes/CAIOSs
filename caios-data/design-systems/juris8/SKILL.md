---
name: juris8-design
description: Use this skill to generate well-branded interfaces and assets for Juris8 (a Brazilian legal-tech platform — "um sistema para advogados"), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference
- **Brand:** Juris8 — Brazilian legal-tech (pt-BR). Dark-first, violet accent. Voice is direct, confident, peer-to-peer ("você/seu"). No emoji.
- **Entry CSS:** link `styles.css` (it `@import`s every token + the webfonts).
- **Fonts:** Geist (display + UI sans; heavy `--fw-display` weight for headlines), Geist Mono (eyebrows, tags, data) — via Google Fonts. No serif.
- **Color:** bg `#07050F`, brand violet `--juris-500 #7C3AED`; cool violet-tinted neutrals ("ink"); soft status colors with tinted fills.
- **Backdrop:** add `class="juris-ambient"` to the page body for the signature radial-glow + grid.
- **Icons:** Lucide (CDN), thin outline; render with `<i data-lucide="name">` + `lucide.createIcons()`. Never emoji.
- **Components:** `window.Juris8DesignSystem_75d483` → Button, Badge, Eyebrow, Card, Input, Select, Alert, Stat. See each component's `.prompt.md`.
- **UI kit:** `ui_kits/det-monitor/` is a full interactive product recreation to learn the patterns from.
