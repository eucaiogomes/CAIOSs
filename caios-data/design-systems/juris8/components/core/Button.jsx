import React from 'react';

/**
 * Juris8 Button — gradient violet primary, neutral secondary, quiet ghost.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: 13 },
    md: { padding: '12px 22px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 15 },
  };

  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-medium)',
    letterSpacing: 'var(--ls-body)',
    borderRadius: 'var(--r-4)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.45 : 1,
    transition: 'filter var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: 'var(--grad-btn)',
      color: '#fff',
      boxShadow: 'var(--shadow-btn)',
    },
    secondary: {
      background: 'var(--surface-3)',
      color: 'var(--text)',
      borderColor: 'var(--hairline-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-300)',
    },
    danger: {
      background: 'transparent',
      color: 'var(--bad)',
      borderColor: 'var(--border-bad)',
    },
  };

  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? (
    variant === 'primary' ? { filter: 'brightness(1.07)', transform: 'translateY(-1px)' } :
    variant === 'secondary' ? { background: 'var(--surface-2)', transform: 'translateY(-1px)', borderColor: 'rgba(179,136,251,0.25)' } :
    variant === 'ghost' ? { background: 'rgba(255,255,255,0.05)', color: 'var(--text)' } :
    { background: 'var(--fill-bad)' }
  ) : {};

  return (
    <button
      type={type}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
