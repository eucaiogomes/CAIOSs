Base dark surface card for Juris8 — feature blocks, panels, content containers. 28px radius, hairline border, violet hover lift.

```jsx
<Card>
  <span className="feat-ic"><i data-lucide="repeat"></i></span>
  <h3>Mais recorrência</h3>
  <p>Venda um plano mensal que renova sozinho, todo mês.</p>
</Card>

<Card featured>{/* violet ring + gradient — for the standout card */}</Card>
```

Props: `featured` (violet ring + gradient fill for the emphasis card), `hover` (toggle lift), `padding`. Compose icon badges, headings and copy inside — the card is just the shell.
