# DET Monitor — UI Kit

Interactive recreation of the **Juris8 DET Monitor** product: the marketing landing page plus the internal monitoring app. Recreated from the source codebase (`LP-DET-atualizada/index.html`, `home-styles.css`, and the `mockup9-embed` certificate flow).

## Screens

- **`Marketing.jsx`** — the public landing: sticky nav, hero with the live DET alert panel, hero pills, and the trust strip. "Entrar" / CTA buttons drop the user into the app.
- **`Sidebar.jsx`** — app left nav (Dashboard, Clientes, Monitoramento, CNPJs, Certificado, Comissões, Configurações) + the office/user footer.
- **`Topbar.jsx`** — breadcrumb, search, live-status badge, notifications.
- **`Dashboard.jsx`** — the DET monitoring panel: metric tiles + the unified alert inbox (urgent / warning / resolved), built on the `Alert` and `Stat` primitives.
- **`CertConfig.jsx`** — interactive certificate upload → sync → CNPJ selection → activate monitoring (faithful to the `Mockup9Certificado` flow).
- **`leads.html`** — Caixa de Leads (triage inbox). **Real integration**: pulls live leads submitted from `site/index.html` via the shared Supabase (`public.leads`). Maps landing fields + `source` tracking. Supports status pipeline and notes (tries to write back). "Atualizar" refreshes. Falls back to seeds.
- **`index.html`** — orchestrates everything: lands on the marketing page, "Entrar" → app shell with working sidebar navigation. **Dashboard** and **Certificado** are the fully interactive screens. Open `leads.html` directly for the leads triage view.

## Notes

- Composes the design-system primitives from `window.Juris8DesignSystem_75d483` (Button, Badge, Alert, Stat, Eyebrow) rather than re-implementing them.
- Icons via Lucide CDN (the same set the product ships). The `j8` logo is loaded from `assets/logo.png`.
- This is a cosmetic recreation for design reference — not production code. Animations and data are mocked, but leads.html now does **real reads/writes** against the Supabase used by the public landing page.
- To test the full flow:
1. Open `site/index.html`, submit the specialist form (or use "+ Lead teste" inside leads.html)
2. Open `leads.html` → click **Atualizar**
3. New leads appear with correct `source` (e.g. "Landing — CTA Final")

Inside the Leads UI there is also a **"+ Lead teste"** button that inserts a demo lead directly via Supabase (super useful for quick validation).

## Preview (Windows / PowerShell)

From the `juris8/` folder run:

```powershell
.\start-preview.ps1
```

Then open:
- Landing + form: http://localhost:8000/site/index.html
- Real leads inbox: http://localhost:8000/ui_kits/det-monitor/leads.html

(If no Python, it falls back to npx http-server)
