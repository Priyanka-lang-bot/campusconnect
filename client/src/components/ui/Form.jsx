// Accessible form controls. Every control gets a real <label>, and hints /
// errors are linked with aria-describedby so screen readers announce them.
import { forwardRef, useId } from 'react';
import Icon from './Icon.jsx';
import styles from './Form.module.css';

function Field({ id, label, hint, error, required, children, className = '' }) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export const TextField = forwardRef(function TextField({ label, hint, error, required, className, ...inputProps }, ref) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        ref={ref}
        id={id}
        className={styles.control}
        aria-invalid={Boolean(error) || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
      />
    </Field>
  );
});

export const TextArea = forwardRef(function TextArea({ label, hint, error, required, className, maxLength, value = '', ...props }, ref) {
  const id = useId();
  return (
    <Field
      id={id}
      label={label}
      hint={hint ?? (maxLength ? `${value.length}/${maxLength} characters` : undefined)}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        ref={ref}
        id={id}
        className={`${styles.control} ${styles.textarea}`}
        aria-invalid={Boolean(error) || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, error, hint ?? maxLength)}
        maxLength={maxLength}
        value={value}
        {...props}
      />
    </Field>
  );
});

export const SelectField = forwardRef(function SelectField({ label, hint, error, required, options, className, ...props }, ref) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        ref={ref}
        id={id}
        className={`${styles.control} ${styles.select}`}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      >
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
});

// On/off switch built on a native checkbox (keyboard + screen reader friendly).
export function Toggle({ label, description, checked, onChange, disabled }) {
  const id = useId();
  return (
    <div className={styles.toggleRow}>
      <div>
        <label htmlFor={id} className={styles.toggleLabel}>
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className={styles.hint}>
            {description}
          </p>
        )}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-desc` : undefined}
      />
    </div>
  );
}

export function FormGrid({ children }) {
  return <div className={styles.grid}>{children}</div>;
}

export function FormBanner({ tone = 'error', children }) {
  return (
    <div className={`${styles.banner} ${tone === 'error' ? styles.bannerError : styles.bannerSuccess}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'error' ? 'alert' : 'check'} size={18} />
      <div>{children}</div>
    </div>
  );
}
