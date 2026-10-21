// Validation schemas for every resource the API accepts.
const PRIORITIES = ['low', 'medium', 'high'];
const TASK_STATUSES = ['todo', 'in-progress', 'done'];
const SUBJECT_COLORS = ['blue', 'lavender', 'teal', 'amber', 'rose', 'slate'];
const FEEDBACK_CATEGORIES = ['bug', 'feature', 'content', 'general'];

const taskSchema = {
  title: { type: 'string', required: true, minLength: 3, maxLength: 120, label: 'Title' },
  description: { type: 'string', maxLength: 1000, label: 'Description' },
  dueDate: { type: 'date', required: true, label: 'Due date' },
  priority: { type: 'string', required: true, enum: PRIORITIES, label: 'Priority' },
  status: { type: 'string', enum: TASK_STATUSES, label: 'Status' },
  subjectId: { type: 'string', nullable: true, label: 'Subject' },
  tags: { type: 'array', maxItems: 6, itemMaxLength: 24, label: 'Tags' },
};

const subjectSchema = {
  name: { type: 'string', required: true, minLength: 2, maxLength: 80, label: 'Subject name' },
  code: { type: 'string', maxLength: 12, label: 'Course code' },
  color: { type: 'string', enum: SUBJECT_COLORS, label: 'Colour' },
  priority: { type: 'string', required: true, enum: PRIORITIES, label: 'Priority' },
  targetHours: { type: 'number', required: true, min: 1, max: 200, label: 'Target hours' },
  examDate: { type: 'date', nullable: true, label: 'Exam date' },
};

const sessionSchema = {
  subjectId: { type: 'string', required: true, label: 'Subject' },
  title: { type: 'string', required: true, minLength: 3, maxLength: 120, label: 'Topic' },
  date: { type: 'date', required: true, label: 'Date' },
  durationMinutes: { type: 'number', required: true, integer: true, min: 10, max: 600, label: 'Duration' },
  completed: { type: 'boolean', label: 'Completed' },
  notes: { type: 'string', maxLength: 500, label: 'Notes' },
};

const feedbackSchema = {
  name: { type: 'string', required: true, minLength: 2, maxLength: 80, label: 'Name' },
  email: { type: 'email', required: true, maxLength: 120, label: 'Email' },
  category: { type: 'string', required: true, enum: FEEDBACK_CATEGORIES, label: 'Category' },
  rating: { type: 'number', required: true, integer: true, min: 1, max: 5, label: 'Rating' },
  message: { type: 'string', required: true, minLength: 20, maxLength: 2000, label: 'Message' },
};

const profileSchema = {
  name: { type: 'string', required: true, minLength: 2, maxLength: 80, label: 'Name' },
  email: { type: 'email', required: true, maxLength: 120, label: 'Email' },
  program: { type: 'string', maxLength: 100, label: 'Program' },
  year: { type: 'number', integer: true, min: 1, max: 5, label: 'Year' },
  semester: { type: 'number', integer: true, min: 1, max: 10, label: 'Semester' },
  rollNumber: { type: 'string', maxLength: 30, label: 'Roll number' },
  bio: { type: 'string', maxLength: 280, label: 'Bio' },
  interests: { type: 'array', maxItems: 8, itemMaxLength: 30, label: 'Interests' },
};

const preferencesSchema = {
  weeklyStudyGoalHours: { type: 'number', integer: true, min: 1, max: 80, label: 'Weekly study goal' },
  showCompletedTasks: { type: 'boolean', label: 'Show completed tasks' },
  confirmDeletes: { type: 'boolean', label: 'Confirm before deleting' },
  compactMode: { type: 'boolean', label: 'Compact mode' },
  startPage: { type: 'string', enum: ['/', '/tasks', '/study', '/events'], label: 'Start page' },
};

module.exports = {
  PRIORITIES,
  TASK_STATUSES,
  SUBJECT_COLORS,
  FEEDBACK_CATEGORIES,
  taskSchema,
  subjectSchema,
  sessionSchema,
  feedbackSchema,
  profileSchema,
  preferencesSchema,
};
