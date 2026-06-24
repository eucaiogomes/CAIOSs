import React from 'react';

/**
 * Juris8 Input — labelled text field on a raised surface with a violet
 * focus ring. Use inside forms (e.g. the "Falar com especialista" modal).
 */
export function Input({
  label,
  id,
  hint,
  type = 'text',
  textarea = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);

  const fieldStyle = {
    width: '100%',
    background: 'var(--surface-2)',
    border: `1px solid ${focus ? 'var(--juris-400)' : 'var(--hairline-strong)'}`,
    borderRadius: 'var(--r-3)',
    padding: '10px 12px',
    fontSize: 14,
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    boxShadow: focus ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    resize: textarea ? 'vertical' : undefined,
    minHeight: textarea ? 82 : undefined,
    ...style,
  };

  const Field = textarea ? 'textarea' : 'input';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 12, fontWeight: 'var(--fw-medium)', color: 'var(--ink-300)', marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <Field
        id={id}
        type={textarea ? undefined : type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={fieldStyle}
        {...rest}
      />
      {hint && (
        <span style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 6 }}>{hint}</span>
      )}
    </div>
  );
}
