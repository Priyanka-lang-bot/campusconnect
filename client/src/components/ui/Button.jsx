import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import styles from './Button.module.css';

// Reusable button. Renders a <Link> when `to` is given, otherwise a <button>.
// Variants: primary | secondary | ghost | danger. Sizes: sm | md.
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, iconOnly = false, loading = false, to, className = '', children, ...rest },
  ref,
) {
  const classes = [styles.button, styles[variant], styles[size], iconOnly && styles.iconOnly, className].filter(Boolean).join(' ');
  const content = (
    <>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {iconOnly ? <span className="visually-hidden">{children}</span> : children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button ref={ref} type="button" className={classes} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

export default Button;
