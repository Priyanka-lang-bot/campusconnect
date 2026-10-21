const { createId, nowIso } = require('../utils/ids');

const MAX_ITEMS = 30;

// Push a "recent activity" entry onto a draft database inside store.update().
function logActivity(draft, type, message) {
  draft.activity = [{ id: createId('act'), type, message, at: nowIso() }, ...(draft.activity || [])].slice(0, MAX_ITEMS);
}

module.exports = { logActivity };
