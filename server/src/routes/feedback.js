// /api/feedback — validated feedback submissions.
const express = require('express');
const store = require('../db/store');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { feedbackSchema } = require('../validators/schemas');
const { createId, nowIso } = require('../utils/ids');

const router = express.Router();

router.get('/', (req, res) => {
  const feedback = store.read('feedback').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ data: feedback, count: feedback.length });
});

router.post(
  '/',
  validateBody(feedbackSchema),
  asyncHandler(async (req, res) => {
    const entry = await store.update((db) => {
      const created = { id: createId('fbk'), ...req.validated, createdAt: nowIso() };
      db.feedback.push(created);
      return created;
    });
    res.status(201).json({ data: entry, message: 'Thanks! Your feedback has been recorded.' });
  }),
);

module.exports = router;
