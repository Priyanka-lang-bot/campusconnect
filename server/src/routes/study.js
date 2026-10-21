// /api/study — subjects and study sessions for the Study Planner.
const express = require('express');
const store = require('../db/store');
const asyncHandler = require('../middleware/asyncHandler');
const findById = require('../middleware/findById');
const { validateBody } = require('../middleware/validate');
const { subjectSchema, sessionSchema } = require('../validators/schemas');
const { subjectStats, weeklyMinutes } = require('../services/study');
const { logActivity } = require('../services/activity');
const HttpError = require('../utils/HttpError');
const { createId, nowIso } = require('../utils/ids');

const router = express.Router();

/* ---------------------------- Subjects ---------------------------- */

router.get('/subjects', (req, res) => {
  const sessions = store.read('sessions');
  const subjects = store.read('subjects').map((s) => subjectStats(s, sessions));
  res.json({ data: subjects, count: subjects.length });
});

// Subject detail: stats + its sessions + tasks linked to it (academic deadlines).
router.get('/subjects/:id', findById('subjects', 'Subject'), (req, res) => {
  const sessions = store.read('sessions');
  const subject = subjectStats(req.record, sessions);
  res.json({
    data: {
      ...subject,
      sessions: sessions.filter((s) => s.subjectId === subject.id).sort((a, b) => a.date.localeCompare(b.date)),
      tasks: store.read('tasks').filter((t) => t.subjectId === subject.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    },
  });
});

router.post(
  '/subjects',
  validateBody(subjectSchema),
  asyncHandler(async (req, res) => {
    const name = req.validated.name.toLowerCase();
    if (store.read('subjects').some((s) => s.name.toLowerCase() === name)) {
      throw HttpError.conflict(`A subject named "${req.validated.name}" already exists.`);
    }
    const subject = await store.update((db) => {
      const created = { id: createId('sub'), code: '', color: 'slate', examDate: null, ...req.validated };
      db.subjects.push(created);
      logActivity(db, 'study', `Added subject ${created.name}`);
      return created;
    });
    res.status(201).json({ data: subjectStats(subject, store.read('sessions')) });
  }),
);

router.put(
  '/subjects/:id',
  findById('subjects', 'Subject'),
  validateBody(subjectSchema),
  asyncHandler(async (req, res) => {
    const subject = await store.update((db) => {
      const index = db.subjects.findIndex((s) => s.id === req.params.id);
      db.subjects[index] = { ...db.subjects[index], code: '', examDate: null, ...req.validated };
      return db.subjects[index];
    });
    res.json({ data: subjectStats(subject, store.read('sessions')) });
  }),
);

// Deleting a subject removes its sessions and unlinks (but keeps) its tasks.
router.delete(
  '/subjects/:id',
  findById('subjects', 'Subject'),
  asyncHandler(async (req, res) => {
    await store.update((db) => {
      db.subjects = db.subjects.filter((s) => s.id !== req.params.id);
      db.sessions = db.sessions.filter((s) => s.subjectId !== req.params.id);
      db.tasks = db.tasks.map((t) => (t.subjectId === req.params.id ? { ...t, subjectId: null } : t));
      logActivity(db, 'study', `Removed subject ${req.record.name}`);
    });
    res.status(204).end();
  }),
);

/* ---------------------------- Sessions ---------------------------- */

router.get('/sessions', (req, res) => {
  const { subjectId, from, to } = req.query;
  const sessions = store
    .read('sessions')
    .filter((s) => !subjectId || s.subjectId === subjectId)
    .filter((s) => !from || s.date >= from)
    .filter((s) => !to || s.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json({ data: sessions, count: sessions.length });
});

router.get('/stats', (req, res) => {
  const sessions = store.read('sessions');
  res.json({
    data: {
      weekly: weeklyMinutes(sessions),
      totalCompletedMinutes: sessions.filter((s) => s.completed).reduce((sum, s) => sum + s.durationMinutes, 0),
      upcomingCount: sessions.filter((s) => !s.completed).length,
    },
  });
});

function assertSubject(subjectId) {
  if (!store.read('subjects').some((s) => s.id === subjectId)) {
    throw HttpError.badRequest('Validation failed.', { subjectId: 'Selected subject does not exist.' });
  }
}

router.post(
  '/sessions',
  validateBody(sessionSchema),
  asyncHandler(async (req, res) => {
    assertSubject(req.validated.subjectId);
    const session = await store.update((db) => {
      const created = { id: createId('ses'), completed: false, notes: '', ...req.validated, createdAt: nowIso() };
      db.sessions.push(created);
      logActivity(db, 'study', `Planned ${created.durationMinutes} min — ${created.title}`);
      return created;
    });
    res.status(201).json({ data: session });
  }),
);

router.patch(
  '/sessions/:id',
  findById('sessions', 'Study session'),
  validateBody(sessionSchema, { partial: true }),
  asyncHandler(async (req, res) => {
    if (req.validated.subjectId) assertSubject(req.validated.subjectId);
    const session = await store.update((db) => {
      const index = db.sessions.findIndex((s) => s.id === req.params.id);
      const before = db.sessions[index];
      const updated = { ...before, ...req.validated };
      db.sessions[index] = updated;
      if (!before.completed && updated.completed) {
        logActivity(db, 'study', `Logged ${updated.durationMinutes} min — ${updated.title}`);
      }
      return updated;
    });
    res.json({ data: session });
  }),
);

router.delete(
  '/sessions/:id',
  findById('sessions', 'Study session'),
  asyncHandler(async (req, res) => {
    await store.update((db) => {
      db.sessions = db.sessions.filter((s) => s.id !== req.params.id);
    });
    res.status(204).end();
  }),
);

module.exports = router;
