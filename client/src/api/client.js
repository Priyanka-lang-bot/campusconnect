// A thin wrapper around the Fetch API.
// - Sends/receives JSON
// - Converts non-2xx responses into ApiError objects with field-level details
// - Turns network failures into a friendly message
// - Supports AbortController signals so components can cancel requests

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details; // e.g. { title: 'Title is required.' }
  }
}

export async function request(path, { method = 'GET', body, signal, query } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (query) {
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => url.searchParams.set(key, value));
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the CampusConnect server. Is the API running on port 5000?');
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON response (e.g. proxy error page)
  }

  if (!response.ok) {
    const message = payload?.error?.message || `Request failed with status ${response.status}.`;
    throw new ApiError(message, { status: response.status, details: payload?.error?.details });
  }
  return payload;
}

// Convenience helpers built with arrow functions and rest/spread.
export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};
