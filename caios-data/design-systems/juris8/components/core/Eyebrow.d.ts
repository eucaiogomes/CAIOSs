import React from 'react';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/**
 * Mono uppercase section label with a leading violet dot — the kicker that
 * sits above section headings (e.g. "COMO FUNCIONA", "SEGURANÇA").
 */
export function Eyebrow(props: EyebrowProps): JSX.Element;
