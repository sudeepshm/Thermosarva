/**
 * src/api/client.js — Base fetch wrapper for Thermosarva backend.
 *
 * All requests go through /api (proxied by Vite → http://localhost:8000).
 */

const BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : (import.meta.env.PROD
      ? 'https://thermosarva-backend.onrender.com/api'
      : '/api');

async function request(method, path, body = undefined, retries = 2) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (retries > 0 && (res.status === 502 || res.status === 503 || res.status === 504 || res.status === 429)) {
        await new Promise((r) => setTimeout(r, 2000));
        return request(method, path, body, retries - 1);
      }
      const msg = json?.error?.message || json?.detail || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return json;
  } catch (err) {
    if (retries > 0 && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.name === 'TypeError')) {
      await new Promise((r) => setTimeout(r, 2500));
      return request(method, path, body, retries - 1);
    }
    throw err;
  }
}

export const api = {
  get:  (path)        => request('GET',  path),
  post: (path, body)  => request('POST', path, body),
};
