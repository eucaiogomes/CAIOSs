Labelled dropdown for Juris8 forms — matches Input styling with a custom violet chevron.

```jsx
<Select
  id="f-cnpjs"
  label="Quantos CNPJs você pretende monitorar?"
  options={[
    { value: '', label: 'Selecione...' },
    { value: '1-5', label: '1 a 5 CNPJs' },
    { value: '6-15', label: '6 a 15 CNPJs' },
  ]}
/>
```

Options accept plain strings or `{value, label}` objects.
