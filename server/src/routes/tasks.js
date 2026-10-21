// /api/tasks — full CRUD for the task manager.
const express = require('express');
const store = require('../db/store');
const asyncHandler = require('../middleware/asyncHandler');
const findById = require('../middleware/findById');
const { validateBody } = require('../middleware/validate');
const { taskSchema, TASK_STATUSES, PRIORITIES } = require('../validators/schemas');
const { logActivity } = require('../services/activity');
const HttpError = require('../utils/HttpError');
const { createId, nowIso } = require('../utils/ids');

const router = express.Router();
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function assertSubjectExists(subjectId) {
  if (subjectId && !store.read('subjects').some((s) => s.id === subjectId)) {
    throw HttpError.badRequest('Validation failed.', { subjectId: 'Selected subject does not exist.' });
  }
}

// GET /api/tasks?status=todo&priority=high&subjectId=sub_daa&q=assignment&sort=dueDate
router.get('/', (req, res) => {
  const { status, priority, subjectId, q, sort = 'dueDate' } = req.query;

  if (status && !TASK_STATUSES.includes(status)) throw HttpError.badRequest(`Unknown status "${status}".`);
  if (priority && !PRIORITIES.includes(priority)) throw HttpError.badRequest(`Unknown priority "${priority}".`);

  const term = q?.toString().trim().toLowerCase();
  const tasks = store
    .read('tasks')
    .filter((t) => !status || t.status === status)
    .filter((t) => !priority || t.priority === priority)
    .filter((t) => !subjectId || t.subjectId === subjectId)
    .filter((t) => !term || `${t.title} ${t.description} ${t.tags.join(' ')}`.toLowerCase().includes(term))
    .sort((a, b) => {
      if (sort === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (sort === 'createdAt') return b.createdAt.localeCompare(a.createdAt);
      return a.dueDate.localeCompare(b.dueDate);
    });

  res.json({ data: tasks, count: tasks.length });
});

router.get('/:id', findById('tasks', 'Task'), (req, res) => {
  res.json({ data: req.record });
});

router.post(
  '/',
  validateBody(taskSchema),
  asyncHandler(async (req, res) => {
    assertSubjectExists(req.validated.subjectId);
    const task = await store.update((db) => {
      const created = {
        id: createId('tsk'),
        description: '',
        status: 'todo',
        subjectId: null,
        tags: [],
        ...req.validated,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.tasks.push(created);
      logActivity(db, 'task', `Added task “${created.title}”`);
      return created;
    });
    res.status(201).location(`/api/tasks/${task.id}`).json({ data: task });
  }),
);

// PUT replaces the editable fields; PATCH changes only what is sent.
const updateTask = (partial) =>
  asyncHandler(async (req, res) => {
    if ('subjectId' in req.validated) assertSubjectExists(req.validated.subjectId);
    const task = await store.update((db) => {
      const index = db.tasks.findIndex((t) => t.id === req.params.id);
      const previous = db.tasks[index];
      const base = partial ? previous : { ...previous, description: '', subjectId: null, tags: [] };
      const updated = { ...base, ...req.validated, id: previous.id, createdAt: previous.createdAt, updatedAt: nowIso() };
      db.tasks[index] = updated;

      if (previous.status !== 'done' && updated.status === 'done') logActivity(db, 'task', `Completed “${updated.title}”`);
      else if (previous.status === 'done' && updated.status !== 'done') logActivity(db, 'task', `Reopened “${updated.title}”`);
      else if (!partial) logActivity(db, 'task', `Edited “${updated.title}”`);
      return updated;
    });
    res.json({ data: task });
  });

router.put('/:id', findById('tasks', 'Task'), validateBody(taskSchema), updateTask(false));
router.patch('/:id', findById('tasks', 'Task'), validateBody(taskSchema, { partial: true }), updateTask(true));

router.delete(
  '/:id',
  findById('tasks', 'Task'),
  asyncHandler(async (req, res) => {
    await store.update((db) => {
      db.tasks = db.tasks.filter((t) => t.id !== req.params.id);
      logActivity(db, 'task', `Deleted “${req.record.title}”`);
    });
    res.status(204).end();
  }),
);

module.exports = router;
