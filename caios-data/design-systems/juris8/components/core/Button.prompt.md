Primary action control for Juris8 — gradient violet CTA, neutral secondary, quiet ghost; use for any clickable action.

```jsx
<Button variant="primary" size="lg" iconRight={<i data-lucide="arrow-right"></i>}>
  Falar com um especialista
</Button>
<Button variant="secondary">Entrar</Button>
<Button variant="ghost" size="sm">Cancelar</Button>
```

Variants: `primary` (main CTA), `secondary` (neutral surface), `ghost` (toolbar/nav), `danger`. Sizes: `sm` / `md` / `lg`. Props: `fullWidth`, `disabled`, `iconLeft`, `iconRight`. Icons are passed as nodes (Lucide `<i data-lucide>` or SVG) — the component does not draw them.
