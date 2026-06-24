# Juris8 Design System

A dark-first, violet-accented design system for **Juris8** — *"um sistema para advogados"* (a software platform for lawyers, in Brazilian Portuguese). The system is extracted from the **DET Monitor** product: a tool that lets law firms monitor their clients' *Domicílio Eletrônico Trabalhista* (Brazil's electronic labor-court mailbox), receive alerts before deadlines hit, and turn that prevention into recurring monthly revenue.

The aesthetic is confident legal-tech: near-black violet-tinted backgrounds, a single bright violet brand accent, a clean geometric sans (Geist) for everything from hero headlines to UI, and a mono face for labels and data. It reads premium and technical without feeling cold.

## The live site — central hub

The **real landing page** is checked into this project at **`site/index.html`** (imported from the GitHub repo [`eucaiogomes/LP-DET-atualizada`](https://github.com/eucaiogomes/LP-DET-atualizada)). It is the **source of truth** — the central hub this whole design system is extracted from, and from which new work is built. It appears in the **Design System tab** under the **"Site"** group, so it is always one click away.

`site/` contains the complete, self-contained site:
- `index.html` — the full marketing landing (hero, como funciona, segurança, antes/depois, receita recorrente, FAQ, CTA, modal).
- `home-styles.css` — the complete original stylesheet.
- `logo.png` — the Juris8 logo used by the site.
- `mockup9-embed/dist/` — the built certificate-config demo, embedded by the landing via `<iframe>`.

> The design-system tokens in `tokens/` are distilled FROM this site's `home-styles.css`. When the site changes, re-derive the tokens to keep them in sync.

## Sources

Built from a single attached codebase (read-only):

- **`DET atualizada/LP-DET-atualizada/`** — the DET Monitor landing page.
  - `index.html` — full marketing landing (hero, "como funciona", segurança, antes/depois, receita recorrente, FAQ, CTA, modal).
  - `home-styles.css` — the complete stylesheet; the source of all tokens, the ambient background, animation system and component patterns.
  - `logo.png` — the Juris8 logo (`j8` mark + JURIS 8 wordmark). → copied to `assets/logo.png`.
  - `mockup9-embed/src/Mockup9Certificado.tsx` + `WindowFrame.tsx` — the animated in-app demo of certificate upload + CNPJ selection. → recreated as the `CertConfig` screen.

No Figma file or slide deck was provided.

---

## CONTENT FUNDAMENTALS

**Language:** Brazilian Portuguese (pt-BR), throughout. Consumer-facing copy should be written in pt-BR.

**Voice — direct, confident, a little provocative.** Copy speaks to the lawyer as a peer and challenges them to act. Short declarative sentences and sharp contrasts. The signature line captures the tone: *"O advogado que chega primeiro não apaga incêndio. Ele evita que o incêndio comece."*

**Person:** Addresses the reader as **você / seu / seus** ("seu escritório", "seus clientes", "sua carteira"). First-person plural for what Juris8 does on the firm's behalf ("Montamos uma página…"). Never "I".

**Casing:** Sentence case for headings and body. Eyebrows/kickers, status tags, pills and metadata are **UPPERCASE**, mono, wide-tracked (`COMO FUNCIONA`, `SEGURANÇA`, `LGPD`). Headlines split a sentence so the back half becomes the gradient-violet emphasis: *"3 passos para **começar a monitorar.**"*

**Vocabulary:** Domain-fluent and concrete — *DET, CNPJ, procuração, certificado digital A1/A3, revelia, intimação, prazo, carteira, recorrência, comissão, LGPD*. Money is BRL, pt-BR formatted: `R$ 300 a R$ 800 por CNPJ/mês`, `R$ 42.000`.

**Structure devices:** Numbered steps (`01 / 02 / 03`), before-vs-after columns ("Sem monitoramento" × "Com monitoramento"), benefit lists with check/x marks, "firm gains / client gains" framing.

**Emoji:** **None.** Meaning is carried by Lucide icons and color, never emoji or unicode symbols.

**Vibe:** Trustworthy, preventive, opportunity-focused. The product is sold as *protection* and *recurring revenue*, not as software features.

---

## VISUAL FOUNDATIONS

**Color.** Dark-first. The page sits on `--bg` (`#07050F`, ink-950) with three raised surfaces (`--surface-1/2/3`) climbing toward `#1B1738`. One brand hue does the heavy lifting: **violet `--juris-500` `#7C3AED`** with a full 50–950 scale. Neutrals are a cool, violet-tinted gray ("ink") scale — never pure gray. Status colors are soft and desaturated: `--ok #4ADE80`, `--warn #F5B454`, `--bad #FB7185`, `--info #7DD3FC`, each paired with a ~10% tinted fill and a ~30% border.

**Type.** Two families. **Geist** (`--font-sans` / `--font-display`) carries everything — hero headlines at heavy weight (600/700, `--fw-display`), section headings (500/600), body (400), and buttons. **Geist Mono** (`--font-mono`) — eyebrows, status tags, timestamps, CNPJ numbers, all metadata, always uppercase with `0.1–0.14em` tracking. Headings tight (`-0.02 to -0.03em`); body `1.55–1.7` line-height. Display headings scale fluidly with `clamp()`.

**Spacing & layout.** 4px base scale. Content centered in a `--shell-max` 1400px column with fluid `--shell-pad`. Sections breathe with `clamp(64px,7vw,104px)` vertical rhythm. Cards use 22–28px internal padding.

**Backgrounds.** Never flat. The signature `.juris-ambient` backdrop layers (1) soft radial violet glows in the corners, (2) a faint 72px grid masked to fade at the edges, and optional blurred `.orb` circles. No photography; no gradient-as-hero. Imagery, when present, is dark UI mockups inside a macOS-style window frame (traffic-light dots).

**Corner radii.** Soft, not pill-y: `--r-4/12px` buttons & inputs, `--r-5/16px` panels, `--r-6/20px`–`--r-7/28px` feature cards. Full rounding only for dots, avatars, small inline-alert capsules.

**Cards.** Dark `--surface-1` fill, 1px `--hairline-strong` border, large radius, soft downward shadow. On hover they lift 2–3px, the border warms to violet, and a faint violet glow appears behind. The "featured" card swaps to a violet gradient fill with a `rgba(124,58,237,0.5)` ring.

**Shadows & glow.** Two systems: deep, very-soft black drop shadows for elevation (`--shadow-lg`, `--shadow-card`) and a violet **glow ring** (`--glow`) for brand emphasis. Primary buttons carry an inset top highlight (`--inset-hi`) plus a violet drop for a raised, tactile feel.

**Buttons.** Primary = vertical violet gradient (`--grad-btn`) + inset highlight + violet shadow; hover brightens ~7% and lifts 1px. Secondary = `--surface-3` with a hairline border. Ghost = transparent, gains a faint white wash on hover. Press states subtly darken/shrink. No hard color flips.

**Borders & hairlines.** Almost everything is separated by translucent white hairlines (`rgba(255,255,255,0.06–0.11)`), not solid gray lines. Brand accents use `--border-brand` (violet at 30%).

**Transparency & blur.** Sticky nav and floating chips use `backdrop-filter: blur(24px) saturate(1.4)` over a translucent dark fill (glassmorphism, used sparingly — nav, toasts, floating alert pills). Tinted fills everywhere are translucent so the ambient backdrop reads through.

**Animation.** Calm and purposeful. Entrances fade + rise ~8–16px on an ease-out curve (`cubic-bezier(0.22,1,0.36,1)`), ~0.25s. Hover lifts are 0.25s. The DET demo cycles alerts with gentle cross-fades. No bounces, no springy overshoot, no infinite decorative loops on content. Respect `prefers-reduced-motion`.

**Imagery color vibe.** Cool and dark — violet-tinted, high-contrast UI on near-black. No warm tones, no photography, no grain.

---

## ICONOGRAPHY

- **Library:** [**Lucide**](https://lucide.dev) — the source product loads it from CDN and uses it everywhere. Thin (≈2px), rounded, outline-only line icons. This system links Lucide from CDN in every card and the UI kit (`unpkg.com/lucide`), rendered via `<i data-lucide="name">` + `lucide.createIcons()`.
- **Common glyphs:** `triangle-alert`, `bell` / `bell-ring`, `shield-check`, `lock` / `file-lock-2`, `building-2`, `file-badge-2`, `radar`, `repeat`, `check`, `upload`, `users-round`, `wallet-cards`, `settings`, `arrow-right`, `chevron-right`, `search`.
- **Sizing:** 12–17px inside chips, badges and buttons; ~22px for empty-state / feature glyphs. Color inherits the surrounding text/tone (violet for brand, status color inside alerts).
- **Brand mark:** the `j8` logomark + "JURIS 8" wordmark — `assets/logo.png`. Used at ~30px tall in nav/sidebar.
- **No emoji, no unicode-symbol icons.** Status is shown with a Lucide glyph plus a colored dot/fill — never an emoji.

- **Fonts:** Geist (display + UI sans, with a heavy `--fw-display` weight for headlines), Geist Mono (eyebrows, tags, data) — served via Google Fonts `@import`. No serif.

---

## INDEX — what's in this system

**Root**
- `styles.css` — the single entry point consumers link. `@import`s only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skills-compatible front matter for use in Claude Code.

**`tokens/`** — CSS custom properties, each `@import`ed by `styles.css`:
- `fonts.css` (webfont `@import` — Geist + Geist Mono), `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css` (resets + `.juris-ambient` backdrop + `.shell`).

**`components/core/`** — reusable React primitives (namespace `window.Juris8DesignSystem_75d483`):
- `Button`, `Badge`, `Eyebrow`, `Card`, `Input`, `Select`, `Alert`, `Stat`. Each has `.jsx` + `.d.ts` + `.prompt.md`; `core.card.html` is the specimen.

**`ui_kits/det-monitor/`** — interactive product recreation:
- `index.html` (entry), `Marketing.jsx`, `Sidebar.jsx`, `Topbar.jsx`, `Dashboard.jsx`, `CertConfig.jsx`, `README.md`.

**`guidelines/`** — foundation specimen cards (Design System tab): brand/neutral/status/surface colors, display/sans/mono type, radii/spacing/shadows, logo/gradients/ambient backdrop.

**`assets/`** — `logo.png`.

**Design System tab groups:** Colors · Type · Spacing · Brand · Components · DET Monitor.
