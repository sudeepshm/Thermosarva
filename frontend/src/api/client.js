/**
 * src/api/client.js — Base fetch wrapper for Thermosarva backend.
 *
 * All requests go through /api (proxied by Vite → http://localhost:8000).
 */

const BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '/api';

async function request(method, path, body = undefined) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();

  if (!res.ok) {
    const msg = json?.error?.message || json?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

export const api = {
  get:  (path)        => request('GET',  path),
  post: (path, body)  => request('POST', path, body),
};
