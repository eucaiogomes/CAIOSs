# DET Monitor — UI Kit

Interactive recreation of the **Juris8 DET Monitor** product: the marketing landing page plus the internal monitoring app. Recreated from the source codebase (`LP-DET-atualizada/index.html`, `home-styles.css`, and the `mockup9-embed` certificate flow).

## Screens

- **`Marketing.jsx`** — the public landing: sticky nav, hero with the live DET alert panel, hero pills, and the trust strip. "Entrar" / CTA buttons drop the user into the app.
- **`Sidebar.jsx`** — app left nav (Dashboard, Clientes, Monitoramento, CNPJs, Certificado, Comissões, Configurações) + the office/user footer.
- **`Topbar.jsx`** — breadcrumb, search, live-status badge, notifications.
- **`Dashboard.jsx`** — the DET monitoring panel: metric tiles + the unified alert inbox (urgent / warning / resolved), built on the `Alert` and `Stat` primitives.
- **`CertConfig.jsx`** — interactive certificate upload → sync → CNPJ selection → activate monitoring (faithful to the `Mockup9Certificado` flow).
- **`index.html`** — orchestrates everything: lands on the marketing page, "Entrar" → app shell with working sidebar navigation. **Dashboard** and **Certificado** are the fully interactive screens.

## Notes

- Composes the design-system primitives from `window.Juris8DesignSystem_75d483` (Button, Badge, Alert, Stat, Eyebrow) rather than re-implementing them.
- Icons via Lucide CDN (the same set the product ships). The `j8` logo is loaded from `assets/logo.png`.
- This is a cosmetic recreation for design reference — not production code. Animations and data are mocked.
