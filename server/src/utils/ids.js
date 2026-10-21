const crypto = require('crypto');

// Short, readable, collision-resistant ids such as "tsk_9f2c1a7b3e".
const createId = (prefix) => `${prefix}_${crypto.randomBytes(5).toString('hex')}`;

const nowIso = () => new Date().toISOString();

// Returns a YYYY-MM-DD string `offsetDays` from today (local time).
function dateFromToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

module.exports = { createId, nowIso, dateFromToday };
