// API integration tests using Node's built-in test runner (no extra deps).
// Run with:  npm test   (from the repo root or /server)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Point the store at a throwaway file BEFORE loading any app modules.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'campusconnect-test-'));
process.env.DB_FILE = path.join(tmpDir, 'db.json');

const store = require('../src/db/store');
const { createApp } = require('../src/app');

let server;
let base;

const api = async (method, url, body) => {
  const res = await fetch(`${base}${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

before(async () => {
  await store.init({ reset: true });
  server = createApp({ logRequests: false }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('health check responds', async () => {
  const { status, body } = await api('GET', '/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('task CRUD lifecycle', async () => {
  const created = await api('POST', '/tasks', { title: 'Write unit tests', dueDate: '2026-12-01', priority: 'high', tags: ['testing'] });
  assert.equal(created.status, 201);
  const { id } = created.body.data;
  assert.equal(created.body.data.status, 'todo');

  const patched = await api('PATCH', `/tasks/${id}`, { status: 'done' });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.data.status, 'done');

  const put = await api('PUT', `/tasks/${id}`, { title: 'Write more unit tests', dueDate: '2026-12-02', priority: 'low', status: 'todo' });
  assert.equal(put.body.data.title, 'Write more unit tests');
  assert.deepEqual(put.body.data.tags, []);

  const search = await api('GET', '/tasks?q=more%20unit');
  assert.equal(search.body.count, 1);

  assert.equal((await api('DELETE', `/tasks/${id}`)).status, 204);
  assert.equal((await api('GET', `/tasks/${id}`)).status, 404);
});

test('task validation returns field errors', async () => {
  const { status, body } = await api('POST', '/tasks', { title: 'x', dueDate: '2026-02-31', priority: 'urgent' });
  assert.equal(status, 400);
  assert.ok(body.error.details.title);
  assert.ok(body.error.details.dueDate);
  assert.ok(body.error.details.priority);
});

test('rejects malformed JSON', async () => {
  const res = await fetch(`${base}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(res.status, 400);
});

test('study subjects, sessions and progress', async () => {
  const subject = await api('POST', '/study/subjects', { name: 'Operating Systems', priority: 'medium', targetHours: 2 });
  assert.equal(subject.status, 201);
  const subjectId = subject.body.data.id;

  const dup = await api('POST', '/study/subjects', { name: 'operating systems', priority: 'low', targetHours: 3 });
  assert.equal(dup.status, 409);

  const session = await api('POST', '/study/sessions', { subjectId, title: 'Process scheduling', date: '2026-11-01', durationMinutes: 60 });
  assert.equal(session.status, 201);
  await api('PATCH', `/study/sessions/${session.body.data.id}`, { completed: true });

  const detail = await api('GET', `/study/subjects/${subjectId}`);
  assert.equal(detail.body.data.progress, 50);
  assert.equal(detail.body.data.sessions.length, 1);

  assert.equal((await api('DELETE', `/study/subjects/${subjectId}`)).status, 204);
  const sessions = await api('GET', `/study/sessions?subjectId=${subjectId}`);
  assert.equal(sessions.body.count, 0);
});

test('event registration and conflicts', async () => {
  const { body } = await api('GET', '/events?category=Sports');
  const event = body.data[0];
  const reg = await api('POST', `/events/${event.id}/register`);
  assert.equal(reg.status, 201);
  assert.equal(reg.body.data.attendees, event.attendees + 1);
  assert.equal((await api('POST', `/events/${event.id}/register`)).status, 409);
  const unreg = await api('DELETE', `/events/${event.id}/register`);
  assert.equal(unreg.body.data.registered, false);
});

test('full events cannot be joined', async () => {
  const { body } = await api('GET', '/events?q=mock%20coding');
  const full = body.data[0];
  assert.equal(full.attendees, full.capacity);
  assert.equal((await api('POST', `/events/${full.id}/register`)).status, 409);
});

test('feedback validation and submission', async () => {
  const bad = await api('POST', '/feedback', { name: 'A', email: 'not-an-email', category: 'bug', rating: 9, message: 'short' });
  assert.equal(bad.status, 400);
  assert.deepEqual(Object.keys(bad.body.error.details).sort(), ['email', 'message', 'name', 'rating']);

  const ok = await api('POST', '/feedback', { name: 'Priyanka', email: 'priyanka@example.edu', category: 'feature', rating: 5, message: 'Please add a pomodoro timer to the study planner!' });
  assert.equal(ok.status, 201);
});

test('profile update and preferences', async () => {
  const profile = await api('PUT', '/profile', { name: 'Test Student', email: 'test@example.edu', year: 2, interests: ['AI', 'AI', ' Web '] });
  assert.equal(profile.status, 200);
  assert.deepEqual(profile.body.data.interests, ['AI', 'Web']);
  const prefs = await api('PATCH', '/profile/preferences', { weeklyStudyGoalHours: 15 });
  assert.equal(prefs.body.data.preferences.weeklyStudyGoalHours, 15);
  assert.equal(prefs.body.data.preferences.confirmDeletes, true);
});

test('dashboard aggregates data', async () => {
  const { status, body } = await api('GET', '/dashboard');
  assert.equal(status, 200);
  assert.equal(body.data.weekly.length, 7);
  assert.ok(body.data.subjects.length >= 5);
  assert.ok(body.data.dueSoon.length > 0);
});

test('unknown API route returns JSON 404', async () => {
  const { status, body } = await api('GET', '/does-not-exist');
  assert.equal(status, 404);
  assert.match(body.error.message, /No API route/);
});

test('data persists to disk', async () => {
  const saved = JSON.parse(fs.readFileSync(process.env.DB_FILE, 'utf8'));
  assert.ok(saved.feedback.some((f) => f.name === 'Priyanka'));
});
