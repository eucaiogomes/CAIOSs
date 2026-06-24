The signature DET communication alert for Juris8 — a tinted card representing a new labor-court notification on a monitored CNPJ.

```jsx
<Alert
  tone="urgent"
  icon={<i data-lucide="triangle-alert"></i>}
  title="Construtech Ltda · CNPJ 12.345.678/0001-90"
  description="Notificação de fiscalização · Prazo de resposta: 10 dias úteis"
  time="08:14"
  tag="Urgente"
  action="Analisar"
/>
```

Tones: `urgent` (red), `warning` (amber), `ok` (green/resolved). `tag` and `action` are optional — omit `action` for resolved/informational items.
