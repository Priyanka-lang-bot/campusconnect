// Logs method, URL, status and response time for every request,
// e.g.  GET /api/tasks 200 3.4ms
const requestLogger = ({ silent = false } = {}) => (req, res, next) => {
  if (silent) return next();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const colour = res.statusCode >= 500 ? 31 : res.statusCode >= 400 ? 33 : 32;
    console.log(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m ${req.method} ${req.originalUrl} \x1b[${colour}m${res.statusCode}\x1b[0m ${ms.toFixed(1)}ms`);
  });
  next();
};

module.exports = requestLogger;
