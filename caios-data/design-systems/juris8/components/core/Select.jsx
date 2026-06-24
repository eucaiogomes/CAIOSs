import React from 'react';

/**
 * Juris8 Select — labelled native dropdown styled to match Input, with a
 * custom violet-tinted chevron.
 */
export function Select({ label, id, options = [], style = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);

  const chevron = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C95BD' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>";

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 12, fontWeight: 'var(--fw-medium)', color: 'var(--ink-300)', marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <select
        id={id}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          background: 'var(--surface-2)',
          border: `1px solid ${focus ? 'var(--juris-400)' : 'var(--hairline-strong)'}`,
          borderRadius: 'var(--r-3)',
          padding: '10px 32px 10px 12px',
          fontSize: 14,
          color: 'var(--text)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage: `url("${chevron}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          boxShadow: focus ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
          cursor: 'pointer',
          transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
          ...style,
        }}
        {...rest}
      >
        {options.map((o) => {
          const value = typeof o === 'string' ? o : o.value;
          const labelText = typeof o === 'string' ? o : o.label;
          return <option key={value} value={value}>{labelText}</option>;
        })}
      </select>
    </div>
  );
}
