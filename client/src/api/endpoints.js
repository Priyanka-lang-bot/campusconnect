// One place that knows every API URL. Components import these functions
// instead of building URLs themselves. Each call resolves to the `data` field.
import { api } from './client.js';

const unwrap = (promise) => promise.then((payload) => payload?.data ?? null);

export const dashboardApi = {
  get: (opts) => unwrap(api.get('/dashboard', opts)),
};

export const tasksApi = {
  list: (query, opts) => unwrap(api.get('/tasks', { ...opts, query })),
  create: (task) => unwrap(api.post('/tasks', task)),
  replace: (id, task) => unwrap(api.put(`/tasks/${id}`, task)),
  update: (id, changes) => unwrap(api.patch(`/tasks/${id}`, changes)),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const studyApi = {
  subjects: (opts) => unwrap(api.get('/study/subjects', opts)),
  subject: (id, opts) => unwrap(api.get(`/study/subjects/${id}`, opts)),
  createSubject: (subject) => unwrap(api.post('/study/subjects', subject)),
  updateSubject: (id, subject) => unwrap(api.put(`/study/subjects/${id}`, subject)),
  removeSubject: (id) => api.delete(`/study/subjects/${id}`),
  sessions: (query, opts) => unwrap(api.get('/study/sessions', { ...opts, query })),
  stats: (opts) => unwrap(api.get('/study/stats', opts)),
  createSession: (session) => unwrap(api.post('/study/sessions', session)),
  updateSession: (id, changes) => unwrap(api.patch(`/study/sessions/${id}`, changes)),
  removeSession: (id) => api.delete(`/study/sessions/${id}`),
};

export const eventsApi = {
  list: (query, opts) => unwrap(api.get('/events', { ...opts, query })),
  categories: (opts) => unwrap(api.get('/events/categories', opts)),
  get: (id, opts) => unwrap(api.get(`/events/${id}`, opts)),
  register: (id) => unwrap(api.post(`/events/${id}/register`)),
  unregister: (id) => unwrap(api.delete(`/events/${id}/register`)),
};

export const resourcesApi = {
  list: (query, opts) => unwrap(api.get('/resources', { ...opts, query })),
  categories: (opts) => unwrap(api.get('/resources/categories', opts)),
};

export const feedbackApi = {
  list: (opts) => unwrap(api.get('/feedback', opts)),
  submit: (feedback) => api.post('/feedback', feedback),
};

export const profileApi = {
  get: (opts) => unwrap(api.get('/profile', opts)),
  update: (profile) => unwrap(api.put('/profile', profile)),
  updatePreferences: (prefs) => unwrap(api.patch('/profile/preferences', prefs)),
};
