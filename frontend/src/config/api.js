// Central API base URL - reads from Vite env or falls back to localhost
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Automatically upgrade to https if the site is loaded over https
if (window.location.protocol === 'https:') {
  baseUrl = baseUrl.replace(/^http:/, 'https:');
}

const API_BASE_URL = baseUrl;

export { API_BASE_URL };
