// /api/profile — the student's profile and server-side preferences.
// (Theme is a purely visual, per-browser choice, so it lives in localStorage
//  on the client instead.)
const express = require('express');
const store = require('../db/store');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { profileSchema, preferencesSchema } = require('../validators/schemas');
const { logActivity } = require('../services/activity');
const { nowIso } = require('../utils/ids');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: store.read('profile') });
});

router.put(
  '/',
  validateBody(profileSchema),
  asyncHandler(async (req, res) => {
    const profile = await store.update((db) => {
      db.profile = { ...db.profile, ...req.validated, updatedAt: nowIso() };
      logActivity(db, 'profile', 'Updated profile details');
      return db.profile;
    });
    res.json({ data: profile });
  }),
);

router.patch(
  '/preferences',
  validateBody(preferencesSchema, { partial: true }),
  asyncHandler(async (req, res) => {
    const profile = await store.update((db) => {
      db.profile = { ...db.profile, preferences: { ...db.profile.preferences, ...req.validated }, updatedAt: nowIso() };
      return db.profile;
    });
    res.json({ data: profile });
  }),
);

module.exports = router;
