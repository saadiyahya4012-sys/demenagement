// Centralized backend API configuration.
//
// - Local dev (same-origin via `npm run dev`): VITE_API_URL is unset and
//   requests fall back to relative paths handled by the Express+Vite server.
// - Split deployment (Vercel frontend + Render backend): set VITE_API_URL in
//   Vercel to the Render service URL, e.g. https://moovvert-api.onrender.com
//   (no trailing slash). All API calls below are built with `apiUrl()`.

const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';

/** Base URL of the backend API ('' = same origin). Never ends with '/'. */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

/** Build a full API URL from a path like '/api/login'. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

/**
 * Thin wrapper around fetch that prefixes the centralized backend base URL.
 * Usage: `apiFetch('/api/login', { method: 'POST', ... })`
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
