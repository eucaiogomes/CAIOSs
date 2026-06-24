Metric tile for Juris8 dashboards — a big number over a mono uppercase caption.

```jsx
<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
  <Stat value="14" label="CNPJs monitorados" />
  <Stat value="3" label="Alertas hoje" tone="bad" />
</div>
```

Tones color the value: `default`, `brand`, `ok`, `warn`, `bad`. Lay several out in a grid for a metrics row.
