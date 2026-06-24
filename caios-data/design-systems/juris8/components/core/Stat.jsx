import React from 'react';

/**
 * Juris8 Stat — a metric tile: big number over a mono uppercase label.
 * Used in dashboard metric grids.
 */
export function Stat({ value, label, tone = 'default', style = {}, ...rest }) {
  const tones = {
    default: 'var(--text)',
    brand: 'var(--juris-200)',
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    bad: 'var(--bad)',
  };
  return (
    <div
      style={{
        border: '1px solid var(--hairline-strong)',
        borderRadius: 'var(--r-5)',
        background: 'rgba(255,255,255,0.035)',
        padding: '14px 13px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        ...style,
      }}
      {...rest}
    >
      <strong style={{ fontSize: 28, lineHeight: 1, color: tones[tone] || tones.default }}>{value}</strong>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: 'var(--muted)',
      }}>{label}</span>
    </div>
  );
}
