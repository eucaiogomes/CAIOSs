import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the control. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Render a multi-line <textarea> instead of <input>. @default false */
  textarea?: boolean;
}

/**
 * Labelled text field on a raised surface with a violet focus ring.
 * Set `textarea` for multi-line input.
 */
export function Input(props: InputProps): JSX.Element;
