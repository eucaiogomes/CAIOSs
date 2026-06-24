import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Icon node rendered before the label (e.g. a Lucide <i>). */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to container width. @default false */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

/**
 * Juris8 primary action button. Gradient violet for the main CTA, neutral
 * surface for secondary, quiet ghost for tertiary nav actions.
 *
 * @startingPoint section="Core" subtitle="Button variants & sizes" viewport="700x200"
 */
export function Button(props: ButtonProps): JSX.Element;
