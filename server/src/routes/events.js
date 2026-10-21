// /api/events — browse campus events and register / unregister.
const express = require('express');
const store = require('../db/store');
const asyncHandler = require('../middleware/asyncHandler');
const findById = require('../middleware/findById');
const { logActivity } = require('../services/activity');
const HttpError = require('../utils/HttpError');

const router = express.Router();

// GET /api/events?category=Workshop&q=git&registered=true
router.get('/', (req, res) => {
  const { category, q, registered } = req.query;
  const term = q?.toString().trim().toLowerCase();
  const events = store
    .read('events')
    .filter((e) => !category || category === 'All' || e.category === category)
    .filter((e) => registered !== 'true' || e.registered)
    .filter((e) => !term || [e.title, e.summary, e.organizer, e.venue, ...e.tags].join(' ').toLowerCase().includes(term))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  res.json({ data: events, count: events.length });
});

router.get('/categories', (req, res) => {
  const categories = [...new Set(store.read('events').map((e) => e.category))].sort();
  res.json({ data: categories });
});

router.get('/:id', findById('events', 'Event'), (req, res) => {
  res.json({ data: req.record });
});

router.post(
  '/:id/register',
  findById('events', 'Event'),
  asyncHandler(async (req, res) => {
    const { registered, attendees, capacity, title } = req.record;
    if (registered) throw HttpError.conflict('You are already registered for this event.');
    if (attendees >= capacity) throw HttpError.conflict('This event is full. Registration is closed.');

    const event = await store.update((db) => {
      const e = db.events.find((item) => item.id === req.params.id);
      e.registered = true;
      e.attendees += 1;
      logActivity(db, 'event', `Registered for ${title}`);
      return e;
    });
    res.status(201).json({ data: event });
  }),
);

router.delete(
  '/:id/register',
  findById('events', 'Event'),
  asyncHandler(async (req, res) => {
    if (!req.record.registered) throw HttpError.conflict('You are not registered for this event.');
    const event = await store.update((db) => {
      const e = db.events.find((item) => item.id === req.params.id);
      e.registered = false;
      e.attendees = Math.max(0, e.attendees - 1);
      logActivity(db, 'event', `Cancelled registration for ${e.title}`);
      return e;
    });
    res.json({ data: event });
  }),
);

module.exports = router;
