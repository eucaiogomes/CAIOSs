import React from 'react';

/**
 * Juris8 Card — the base dark surface used for feature cards, panels,
 * and content blocks. Optional hover lift, accent line, and featured ring.
 */
export function Card({
  children,
  featured = false,
  hover = true,
  padding = 26,
  style = {},
  ...rest
}) {
  const [isHover, setHover] = React.useState(false);

  return (
    <div
      onMouseEnter={() => hover && setHover(true)}
      onMouseLeave={() => hover && setHover(false)}
      style={{
        position: 'relative',
        background: featured
          ? 'linear-gradient(145deg, rgba(76,26,158,0.28), rgba(20,17,42,0.92))'
          : 'var(--surface-1)',
        border: `1px solid ${featured ? 'rgba(124,58,237,0.5)' : 'var(--hairline-strong)'}`,
        borderRadius: 'var(--r-7)',
        padding,
        boxShadow: featured
          ? '0 0 0 1px rgba(124,58,237,0.1), 0 24px 56px -32px rgba(124,58,237,0.3)'
          : (isHover ? '0 22px 48px -28px rgba(124,58,237,0.2)' : 'none'),
        transform: isHover ? 'translateY(-3px)' : 'none',
        transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
        borderColor: isHover && !featured ? 'rgba(124,58,237,0.28)' : undefined,
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
