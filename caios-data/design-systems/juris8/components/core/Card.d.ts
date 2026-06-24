import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Highlight as the featured card (violet ring + gradient fill). @default false */
  featured?: boolean;
  /** Enable hover lift + border glow. @default true */
  hover?: boolean;
  /** Inner padding in px. @default 26 */
  padding?: number;
  children?: React.ReactNode;
}

/**
 * Base dark surface card — feature blocks, panels, content containers.
 * 28px radius, hairline border, violet hover lift.
 *
 * @startingPoint section="Core" subtitle="Surface card with hover & featured" viewport="700x240"
 */
export function Card(props: CardProps): JSX.Element;
