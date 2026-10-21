// Search box and filter chips used on the Tasks, Events and Resources pages.
import { forwardRef } from 'react';
import Icon from './Icon.jsx';
import styles from './Filters.module.css';

export const SearchInput = forwardRef(function SearchInput({ value, onChange, label = 'Search', placeholder = 'Search…', shortcut = '/' }, ref) {
  return (
    <div className={styles.search}>
      <Icon name="search" size={16} className={styles.searchIcon} />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label={label}
      />
      {shortcut && !value && (
        <kbd className={styles.kbd} aria-hidden="true">
          {shortcut}
        </kbd>
      )}
    </div>
  );
});

// Single-select chip group exposed as a radiogroup for assistive tech.
export function FilterChips({ label, options, value, onChange }) {
  return (
    <div className={styles.chips} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const { value: optionValue, label: optionLabel, count } = typeof option === 'string' ? { value: option, label: option } : option;
        const active = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles.chip} ${active ? styles.active : ''}`}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
            {count !== undefined && <span className={styles.count}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
