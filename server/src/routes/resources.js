// /api/resources — read-only catalogue of study materials and links.
const express = require('express');
const store = require('../db/store');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, q } = req.query;
  const term = q?.toString().trim().toLowerCase();
  const resources = store
    .read('resources')
    .filter((r) => !category || r.category.toLowerCase() === category.toLowerCase())
    .filter((r) => !term || `${r.title} ${r.description} ${r.type}`.toLowerCase().includes(term));
  res.json({ data: resources, count: resources.length });
});

// Category names with item counts, e.g. [{ name: 'Algorithms', count: 3 }]
router.get('/categories', (req, res) => {
  const counts = store.read('resources').reduce((acc, { category }) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(counts).map(([name, count]) => ({ name, count }));
  res.json({ data });
});

module.exports = router;
