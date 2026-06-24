import React from 'react';

/**
 * Juris8 Badge — compact mono-uppercase status chip with a tinted fill.
 * Tones map to the brand/status palette.
 */
export function Badge({ children, tone = 'brand', dot = false, style = {}, ...rest }) {
  const tones = {
    brand: { color: 'var(--juris-200)', bg: 'var(--fill-brand)', border: 'var(--border-brand)' },
    neutral: { color: 'var(--muted)', bg: 'var(--surface-2)', border: 'var(--hairline-strong)' },
    ok: { color: 'var(--ok)', bg: 'var(--fill-ok)', border: 'var(--border-ok)' },
    warn: { color: 'var(--warn)', bg: 'var(--fill-warn)', border: 'var(--border-warn)' },
    bad: { color: 'var(--bad)', bg: 'var(--fill-bad)', border: 'var(--border-bad)' },
    info: { color: 'var(--info)', bg: 'var(--fill-info)', border: 'var(--border-info)' },
  };
  const t = tones[tone] || tones.brand;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 9.5,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--r-3)',
        padding: '4px 9px',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'currentColor', flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}
