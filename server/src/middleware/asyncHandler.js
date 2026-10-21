// Express 4 does not catch rejected promises from async handlers.
// Wrapping each handler forwards any error to the central error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
