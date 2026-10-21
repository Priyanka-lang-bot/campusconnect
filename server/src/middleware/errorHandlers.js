// 404 for unknown API routes, plus the single centralised error handler.
const HttpError = require('../utils/HttpError');
const config = require('../config');

const notFound = (req, res, next) => {
  next(HttpError.notFound(`No API route matches ${req.method} ${req.originalUrl}`));
};

// Express recognises error-handling middleware by its four arguments.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Malformed JSON from express.json()
  if (err.type === 'entity.parse.failed') {
    err = HttpError.badRequest('Request body is not valid JSON.');
  }
  if (err.type === 'entity.too.large') {
    err = new HttpError(413, 'Request body is too large.');
  }

  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('[error]', err);

  res.status(status).json({
    error: {
      status,
      message: status >= 500 && config.isProduction ? 'Something went wrong on our side.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
};

module.exports = { notFound, errorHandler };
