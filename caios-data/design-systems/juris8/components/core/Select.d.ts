import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Field label rendered above the control. */
  label?: string;
  /** Options as strings or {value, label} objects. */
  options?: (string | SelectOption)[];
}

/**
 * Labelled native dropdown styled to match Input, with a custom violet chevron.
 */
export function Select(props: SelectProps): JSX.Element;
