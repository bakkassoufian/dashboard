import { getAuthHeaders } from '../context/AuthContext';

const base = '/api';
const tokenKey = 'odc_token';
const userKey = 'odc_user';

/** Retourne true si redirection vers login (ex. compte supprimé après seed, JWT encore valide) */
function tryClearStaleAuth401(url, resStatus) {
  if (resStatus !== 401 || typeof localStorage === 'undefined') return false;
  if (!localStorage.getItem(tokenKey)) return false;
  if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) return false;
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  window.location.replace('/login');
  return true;
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const headers = { ...getAuthHeaders(), ...options.headers };
  
  // Don't set Content-Type if body is FormData (let browser handle boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (tryClearStaleAuth401(url, res.status)) {
    return new Promise(() => {});
  }
  if (!res.ok) throw new Error(data.message || res.statusText || 'Erreur');
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined) }),
  postForm: (path, formData, opts) => request(path, { ...opts, method: 'POST', body: formData }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export async function uploadFile(path, file, extra = {}) {
  const { formationId, ...fetchOpts } = extra;
  const form = new FormData();
  form.append('file', file);
  if (formationId) {
    form.append('formationId', formationId);
  }
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form,
    ...fetchOpts,
  });
  const data = await res.json().catch(() => ({}));
  if (tryClearStaleAuth401(url, res.status)) {
    return new Promise(() => {});
  }
  if (!res.ok) throw new Error(data.message || 'Erreur');
  return data;
}
