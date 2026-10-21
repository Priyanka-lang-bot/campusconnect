// Client-side validation rules. These mirror the server rules so users get
// instant feedback; the server still validates everything independently.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// rules: { field: [ [testFn, message], ... ] }
export function validateForm(values, rules) {
  return Object.entries(rules).reduce((errors, [field, checks]) => {
    const failed = checks.find(([test]) => !test(values[field], values));
    return failed ? { ...errors, [field]: failed[1] } : errors;
  }, {});
}

export const required = (label) => [(v) => v !== undefined && v !== null && String(v).trim() !== '', `${label} is required.`];
export const minLength = (n, label) => [(v) => !v || String(v).trim().length >= n, `${label} must be at least ${n} characters.`];
export const maxLength = (n, label) => [(v) => !v || String(v).trim().length <= n, `${label} must be at most ${n} characters.`];
export const isEmail = () => [(v) => !v || EMAIL_RE.test(String(v).trim()), 'Enter a valid email address.'];
export const inRange = (min, max, label) => [
  (v) => v === '' || v === undefined || (Number(v) >= min && Number(v) <= max),
  `${label} must be between ${min} and ${max}.`,
];
