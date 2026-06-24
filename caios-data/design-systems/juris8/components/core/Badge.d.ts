import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Palette tone. @default 'brand' */
  tone?: 'brand' | 'neutral' | 'ok' | 'warn' | 'bad' | 'info';
  /** Show a leading status dot. @default false */
  dot?: boolean;
  children?: React.ReactNode;
}

/**
 * Compact mono-uppercase status chip. Used for live status ("monitorando"),
 * urgency tags ("Urgente"), and trust seals ("LGPD").
 *
 * @startingPoint section="Core" subtitle="Status badges & tones" viewport="700x140"
 */
export function Badge(props: BadgeProps): JSX.Element;
