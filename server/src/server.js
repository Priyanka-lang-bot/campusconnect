// Entry point: initialise the data store, then start listening.
const config = require('./config');
const store = require('./db/store');
const { createApp } = require('./app');

async function start() {
  const { created, file } = await store.init();
  console.log(created ? `[store] Created database with seed data at ${file}` : `[store] Loaded ${file}`);

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`\n  CampusConnect API running at http://localhost:${config.port}/api`);
    console.log(`  Health check:          http://localhost:${config.port}/api/health\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use. Stop the other process or run with PORT=5001.`);
      process.exit(1);
    }
    throw err;
  });

  // Graceful shutdown on Ctrl+C or when a host stops the process.
  const shutdown = (signal) => {
    console.log(`\n${signal} received — closing server.`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
