// Central API base URL - reads from Vite env or falls back to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export { API_BASE_URL };
