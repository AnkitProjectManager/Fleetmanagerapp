// src/config/api.js
const API_VERSION = (import.meta.env.VITE_API_VERSION || 'v1').trim();

const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const sanitizedBase = rawBaseUrl.replace(/\/+$/, '');

const API_BASE_URL = (() => {
  if (sanitizedBase.endsWith(`/${API_VERSION}`)) {
    return sanitizedBase;
  }

  if (sanitizedBase.endsWith('/api')) {
    return `${sanitizedBase}/${API_VERSION}`;
  }

  return `${sanitizedBase}/api/${API_VERSION}`;
})();

export { API_BASE_URL, API_VERSION };
