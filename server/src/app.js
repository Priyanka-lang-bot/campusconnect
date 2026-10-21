// Builds the Express application. Kept separate from server.js so tests can
// create the app without opening a network port.
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandlers');

const taskRoutes = require('./routes/tasks');
const studyRoutes = require('./routes/study');
const eventRoutes = require('./routes/events');
const resourceRoutes = require('./routes/resources');
const feedbackRoutes = require('./routes/feedback');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');

function createApp({ logRequests = true } = {}) {
  const app = express();

  // ---- Global middleware ---------------------------------------------------
  app.disable('x-powered-by');
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.use(requestLogger({ silent: !logRequests }));

  // ---- API routes ----------------------------------------------------------
  const api = express.Router();

  api.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: config.env,
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
    });
  });

  api.use('/dashboard', dashboardRoutes);
  api.use('/tasks', taskRoutes);
  api.use('/study', studyRoutes);
  api.use('/events', eventRoutes);
  api.use('/resources', resourceRoutes);
  api.use('/feedback', feedbackRoutes);
  api.use('/profile', profileRoutes);
  api.use(notFound); // unknown /api/* routes -> JSON 404

  app.use('/api', api);

  // ---- Production: serve the built React app -------------------------------
  // `npm start` at the repo root builds the client and serves it from here,
  // so the whole site runs from a single port.
  if (fs.existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist));
    // Any non-API GET falls back to index.html so React Router can handle it.
    app.get('*', (req, res) => res.sendFile(path.join(config.clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
