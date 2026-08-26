const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// FastAPI's `detail` is a plain string for HTTPException, but for a 422 request
// validation error it's an array of {loc, msg} objects - flatten either shape to text.
async function extractErrorMessage(res) {
  let detail;
  try {
    detail = (await res.json()).detail;
  } catch {
    return res.statusText || `Request failed with status ${res.status}`;
  }

  if (!detail) return `Request failed with status ${res.status}`;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        const field = Array.isArray(e.loc) ? e.loc.slice(1).join('.') : '';
        return field ? `${field}: ${e.msg}` : e.msg;
      })
      .join('; ');
  }
  return `Request failed with status ${res.status}`;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
