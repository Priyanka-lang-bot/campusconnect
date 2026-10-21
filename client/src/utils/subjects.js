export const SUBJECT_COLORS = ['blue', 'lavender', 'teal', 'amber', 'rose', 'slate'];

export const subjectColor = (color = 'slate') => `var(--c-${color})`;

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

// Turn an array into a lookup object: { [id]: item }
export const indexById = (items = []) => Object.fromEntries(items.map((item) => [item.id, item]));
