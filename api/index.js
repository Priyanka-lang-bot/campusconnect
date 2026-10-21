// Vercel serverless entry point. vercel.json rewrites every /api/* request
// here; the Express app keeps the original URL, so its routes work unchanged.
const store = require('../server/src/db/store');
const { createApp } = require('../server/src/app');

const app = createApp();
let ready = null;

module.exports = async (req, res) => {
  if (!ready) {
    ready = store.init().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    });
    await ready;
  } else {
    await ready;
    await store.refresh(); // pick up writes made by other instances
  }
  return app(req, res);
};
