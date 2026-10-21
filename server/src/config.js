// Central configuration — demonstrates Node's `process` and `path` modules.
// Values come from environment variables with sensible defaults, so the app
// runs with zero setup but can still be configured (e.g. PORT=8080 npm start).
const path = require('path');
const { loadEnvFile } = require('./utils/env');

// Optional .env support without an extra dependency.
loadEnvFile(path.join(__dirname, '..', '.env'));

const ROOT_DIR = path.resolve(__dirname, '..');

const config = Object.freeze({
  port: Number(process.env.PORT) || 5000,
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  rootDir: ROOT_DIR,
  dataDir: path.join(ROOT_DIR, 'data'),
  // DB_FILE lets tests point the store at a throwaway file.
  dbFile: process.env.DB_FILE
    ? path.resolve(process.env.DB_FILE)
    : path.join(ROOT_DIR, 'data', 'db.json'),
  clientDist: path.resolve(ROOT_DIR, '..', 'client', 'dist'),
});

module.exports = config;
