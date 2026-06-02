// In dev, this is empty and Vite proxies /api -> backend.
// In production, set VITE_API_BASE_URL to the deployed backend origin.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const TOKEN_KEY = 'gre:token';

/** A typed error that carries the HTTP status so the UI can react per-case. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Allow the auth layer to react globally to an expired/invalid token (401).
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      method,
      signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) onUnauthorized();
    const { message, ...details } = payload.error ?? {};
    throw new ApiError(response.status, message ?? 'Request failed.', details);
  }
  return payload;
}

export const api = {
  /* ----- Auth ----- */
  signup: (data) => request('/auth/signup', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  me: () => request('/auth/me'),

  /* ----- GitHub proxy ----- */
  getProfile: (username, signal) =>
    request(`/github/users/${encodeURIComponent(username)}`, { signal }),

  getRepos: (username, { sort, page, perPage }, signal) => {
    const params = new URLSearchParams({ sort, page: String(page), perPage: String(perPage) });
    return request(`/github/users/${encodeURIComponent(username)}/repos?${params}`, { signal });
  },
};
