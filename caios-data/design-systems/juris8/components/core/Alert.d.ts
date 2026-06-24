import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Severity tone. @default 'urgent' */
  tone?: 'urgent' | 'warning' | 'ok';
  /** Leading icon node (Lucide <i> or SVG). */
  icon?: React.ReactNode;
  /** Bold title line (e.g. company + CNPJ). */
  title: React.ReactNode;
  /** Secondary description line. */
  description?: React.ReactNode;
  /** Timestamp shown top-right (e.g. "08:14"). */
  time?: React.ReactNode;
  /** Mono status tag (e.g. "Urgente"). */
  tag?: React.ReactNode;
  /** Action button label (e.g. "Analisar"). */
  action?: React.ReactNode;
}

/**
 * The signature DET communication alert — tinted, bordered card with icon,
 * title, description, timestamp and optional status tag + action.
 *
 * @startingPoint section="Core" subtitle="DET alert (urgent / warning / ok)" viewport="700x180"
 */
export function Alert(props: AlertProps): JSX.Element;
