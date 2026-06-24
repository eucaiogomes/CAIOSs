import React from 'react';

/**
 * Juris8 Eyebrow — mono uppercase section label with a leading dot and
 * optional auto-numbered counter look. The signature "kicker" above headings.
 */
export function Eyebrow({ children, style = {}, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: 'var(--juris-300)',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        width: 4, height: 4, borderRadius: '50%',
        background: 'var(--juris-300)', flexShrink: 0,
      }} />
      {children}
    </span>
  );
}
