import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import styles from './Card.module.css';

export default function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`${styles.card} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Card header with an optional "View all" link.
export function CardHeader({ title, icon, linkTo, linkLabel = 'View all', id, children }) {
  return (
    <header className={styles.header}>
      <h2 className={styles.title} id={id}>
        {icon && (
          <span className={styles.titleIcon}>
            <Icon name={icon} size={16} />
          </span>
        )}
        {title}
      </h2>
      {children}
      {linkTo && (
        <Link to={linkTo} className={styles.link}>
          {linkLabel}
          <Icon name="chevronRight" size={14} />
        </Link>
      )}
    </header>
  );
}
