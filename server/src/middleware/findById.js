// Reusable "load by :id or 404" middleware.
// Usage: router.get('/:id', findById('tasks', 'Task'), handler)  -> req.record
const store = require('../db/store');
const HttpError = require('../utils/HttpError');

const findById = (collection, label, param = 'id') => (req, res, next) => {
  const record = store.read(collection).find((item) => item.id === req.params[param]);
  if (!record) return next(HttpError.notFound(`${label} "${req.params[param]}" was not found.`));
  req.record = record;
  return next();
};

module.exports = findById;
