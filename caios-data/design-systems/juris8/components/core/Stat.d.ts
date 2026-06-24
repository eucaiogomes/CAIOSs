import React from 'react';

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The metric value (e.g. "14", "R$ 42.000"). */
  value: React.ReactNode;
  /** Mono uppercase caption under the value. */
  label: React.ReactNode;
  /** Color of the value. @default 'default' */
  tone?: 'default' | 'brand' | 'ok' | 'warn' | 'bad';
}

/**
 * Metric tile — big number over a mono uppercase label, for dashboard grids.
 */
export function Stat(props: StatProps): JSX.Element;
