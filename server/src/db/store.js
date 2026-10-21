// JSON-file data store.
//
// Why a JSON file? This is a single-student, locally-run project. A JSON file
// needs no native build tools (unlike SQLite drivers on some Windows setups),
// is easy to inspect during a demo, and still gives us real persistence.
//
// How it stays safe:
//   * All disk access is asynchronous (fs/promises).
//   * Writes are serialised through a promise queue so two requests can never
//     interleave and corrupt the file.
//   * Each write goes to a temporary file first and is then renamed over the
//     real file — rename is atomic, so a crash mid-write never leaves half a file.
//
// This is NOT a multi-user production database; the README says so too.
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
const { buildSeedData } = require('./seed');

let cache = null;
let writeQueue = Promise.resolve();

// On Vercel the filesystem is temporary, so when Upstash Redis credentials are
// present (Vercel sets them when a store is connected) the whole database is
// kept as one JSON value in Redis instead of db.json.
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_KEY = 'campusconnect:db';
let redis = null;
if (redisUrl && redisToken) {
  const { Redis } = require('@upstash/redis');
  redis = new Redis({ url: redisUrl, token: redisToken });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function persist(data) {
  if (redis) {
    await redis.set(REDIS_KEY, data);
    return;
  }
  await fs.mkdir(path.dirname(config.dbFile), { recursive: true });
  const tmp = `${config.dbFile}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, config.dbFile);
}

// Load the database into memory, creating it from seed data on first run.
async function init({ reset = false } = {}) {
  if (redis) {
    cache = reset ? null : await redis.get(REDIS_KEY);
    if (cache) return { created: false, file: 'Upstash Redis' };
    cache = buildSeedData();
    await persist(cache);
    return { created: true, file: 'Upstash Redis' };
  }

  if (reset || !(await fileExists(config.dbFile))) {
    cache = buildSeedData();
    await persist(cache);
    return { created: true, file: config.dbFile };
  }

  try {
    const raw = await fs.readFile(config.dbFile, 'utf8');
    cache = JSON.parse(raw);
  } catch (err) {
    // A corrupted file should not take the whole app down: back it up and reseed.
    const backup = `${config.dbFile}.corrupt-${Date.now()}`;
    await fs.rename(config.dbFile, backup).catch(() => {});
    console.warn(`[store] Could not parse ${config.dbFile} (${err.message}). Backed up to ${backup} and reseeded.`);
    cache = buildSeedData();
    await persist(cache);
    return { created: true, file: config.dbFile };
  }
  return { created: false, file: config.dbFile };
}

function ensureLoaded() {
  if (!cache) throw new Error('Store not initialised. Call store.init() first.');
}

// Read a collection (returns a deep copy so callers cannot mutate the cache).
function read(collection) {
  ensureLoaded();
  return structuredClone(cache[collection]);
}

// Apply a change to the data and persist it. `mutator` receives the live data
// object and may return any value, which is passed back to the caller.
function update(mutator) {
  ensureLoaded();
  const job = writeQueue.then(async () => {
    await refresh(); // another serverless instance may have written since
    const draft = structuredClone(cache);
    const result = await mutator(draft);
    await persist(draft);
    cache = draft; // only commit to memory after the disk write succeeds
    return result;
  });
  // Keep the queue alive even if this job fails.
  writeQueue = job.catch(() => {});
  return job;
}

// Reload the latest data from Redis (no-op for the JSON file, which only this
// process writes).
async function refresh() {
  if (!redis) return;
  cache = (await redis.get(REDIS_KEY)) ?? cache;
}

module.exports = { init, read, update, refresh };
