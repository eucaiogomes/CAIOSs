import React from 'react';

/**
 * Juris8 Alert — the signature DET communication card. A tinted, bordered
 * row with an icon, title, description, timestamp and optional action.
 * Tones: urgent (red), warning (amber), ok (green).
 */
export function Alert({
  tone = 'urgent',
  icon = null,
  title,
  description,
  time,
  tag,
  action,
  style = {},
  ...rest
}) {
  const tones = {
    urgent: { bg: 'var(--fill-bad)', border: 'var(--border-bad)', ic: 'var(--bad)' },
    warning: { bg: 'var(--fill-warn)', border: 'var(--border-warn)', ic: 'var(--warn)' },
    ok: { bg: 'var(--fill-ok)', border: 'var(--border-ok)', ic: 'var(--ok)' },
  };
  const t = tones[tone] || tones.urgent;

  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        background: t.bg,
        borderRadius: 'var(--r-5)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 14px 34px -28px rgba(0,0,0,0.8)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-start', gap: 10 }}>
        <span style={{
          width: 30, height: 30, borderRadius: 'var(--r-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          color: t.ic, flexShrink: 0,
        }}>
          {icon}
        </span>
        <div>
          <strong style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.35, display: 'block' }}>{title}</strong>
          {description && <p style={{ fontSize: 12, color: 'var(--ink-300)', lineHeight: 1.45, marginTop: 3 }}>{description}</p>}
        </div>
        {time && <time style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{time}</time>}
      </div>
      {(tag || action) && (
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', paddingLeft: 40 }}>
          {tag && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, borderRadius: 'var(--r-2)', padding: '4px 9px',
              border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'var(--ink-200)',
            }}>{tag}</span>
          )}
          {action && (
            <button style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, borderRadius: 'var(--r-2)', padding: '4px 9px',
              cursor: 'pointer', color: '#fff',
              background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.38)',
            }}>{action}</button>
          )}
        </div>
      )}
    </div>
  );
}
